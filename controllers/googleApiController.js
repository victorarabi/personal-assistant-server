const { google } = require('googleapis');
const url = require('url');
const { v4: uuidv4 } = require('uuid');
const timezones = require('timezones-list');
const {
  addTokensToUser,
  updateUserTokens,
} = require('../controllers/dbController');
require('dotenv').config();

//environment variables
const CLIENT_ID = process.env.CALENDAR_CLIENT_ID;
const CLIENT_SECRET = process.env.CALENDAR_CLIENT_SECRET;
const REDIRECT_URL = process.env.CALENDAR_REDIRECT_URL;
const CLIENT_URL = process.env.CLIENT_URL;
let userCredential = null;

//create google oAuth2 Client.
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

// Access scopes for read and write calendar and event activity.
const scopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

// Generate a url that asks permissions for the calendar scope
const authorizationUrl = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',
  /** Pass in the scopes array defined above.
   * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
  scope: scopes,
  // Enable incremental authorization. Recommended as a best practice.
  include_granted_scopes: true,
});

//function that handles auth request from user
function authRequest(req, res) {
  res.redirect(authorizationUrl);
}

//function that handles oauth2 callback
async function oauth2Callback(req, res) {
  //parse url string to url object
  let q = url.parse(req.url, true).query;
  //checks for error response from the url callback
  if (q.error) {
    console.log('Error: ' + q.error);
  } else {
    //generate access token
    const { tokens } = await oauth2Client.getToken(q.code);
    //saves token data to variable
    userCredential = tokens;
    const userId = req.user?.id;
    //checks if it is the first request, then save credentials with refresh_token -> that only happens on the first time in which the user provides access to the app.
    if (userCredential.refresh_token) {
      addTokensToUser(userId, userCredential);
    } else {
      //if has already authorized the app, google auth2 server will not send refresh token
      updateUserTokens(userId, userCredential);
    }
    //logic to  redirect back to backend front page
    res.redirect(CLIENT_URL);
  }
}

//function that fetches calendar data
async function getCalendarEvents(req, res, next) {
  //fetch credentials from req.user
  let credential = req?.user.tokens;
  //generate oauth2client credentials based of user credential
  oauth2Client.setCredentials(credential);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });
  const events = response.data.items;
  //filters events to show only user events
  const userEvents = events.filter((event) => {
    const trimID = event.id.slice(0, 17);
    if (trimID === 'personalassistant') {
      return true;
    } else {
      return false;
    }
  });
  res.status(200).send(userEvents);
}

//creates a new event entry at users primary calendar
async function createEvent(req, res, next) {
  const {
    summary,
    description,
    location,
    startDate,
    endDate,
    reminder,
    emailAlert,
    popUpAlert,
  } = req.body;

  //checks to see if request body has all necessary data
  if (
    !summary ||
    !description ||
    !location ||
    !startDate ||
    !endDate ||
    !reminder ||
    !emailAlert ||
    !popUpAlert
  ) {
    res.status(400).send('Information missing, please verify inputed data!');
  }

  //generates uniqueid for event with personalassistant tag
  const uuid = uuidv4();
  let newId = uuid.split('-');
  newId = newId.join('');
  const eventId = 'personalassistant' + newId;

  //append timezone data to the start and end dates
  const tz = timezones.default.filter((timezone) => {
    if (timezone.tzCode === req.user.timezone) {
      return true;
    }
    return false;
  });
  const utcCode = tz[0]?.utc;
  const fullStartDate = startDate + ':00' + utcCode;
  const fullEndDate = endDate + ':00' + utcCode;

  //email and push notification array settings
  let overrideArray = [];
  if (reminder === 'yes') {
    if (emailAlert.emailReminder === 'yes') {
      console.log(emailAlert.reminderTimeUnit);
      if (emailAlert.reminderTimeUnit == 'minutes') {
        console.log('I am at mins');
        overrideArray.push({
          method: 'email',
          minutes: emailAlert.reminderTime,
        });
      } else if (emailAlert.reminderTimeUnit == 'hours') {
        console.log('I am at hours');
        overrideArray.push({
          method: 'email',
          minutes: emailAlert.reminderTime * 60,
        });
      } else if (emailAlert.reminderTimeUnit == 'days') {
        overrideArray.push({
          method: 'email',
          minutes: emailAlert.reminderTime * 1440,
        });
      }
    }
    if (popUpAlert.popUpReminder === 'yes') {
      if (popUpAlert.reminderTimeUnit == 'minutes') {
        overrideArray.push({
          method: 'popup',
          minutes: popUpAlert.reminderTime,
        });
      } else if (popUpAlert.reminderTimeUnit == 'hours') {
        overrideArray.push({
          method: 'popup',
          minutes: popUpAlert.reminderTime * 60,
        });
      } else if (popUpAlert.reminderTimeUnit == 'days') {
        overrideArray.push({
          method: 'popup',
          minutes: popUpAlert.reminderTime * 1440,
        });
      }
    }
  }

  const event = {
    summary: summary,
    id: eventId,
    location: location,
    description: description,
    start: {
      dateTime: fullStartDate,
      timeZone: req.user.timezone,
    },
    end: {
      dateTime: fullEndDate,
      timeZone: req.user.timezone,
    },
    attendees: [],
    reminders: {
      useDefault: false,
      overrides: overrideArray,
    },
  };
  //save credentials from req.user
  const credential = req?.user.tokens;
  //generate oauth2client credentials based of user credential
  oauth2Client.setCredentials(credential);
  //defines calendar api call using user auth and create new event
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  calendar.events.insert(
    { calendarId: 'primary', resource: event },
    function (err, event) {
      if (err) {
        res
          .status(400)
          .send('There was an error contacting the Calendar service: ' + err);
      }
      res.status(201).send(event.data);
    }
  );
}
//updates an existing event from primary calendar
async function updateEvent(req, res) {
  //will change to req.body data
  const event = {
    summary: 'Brainstation I/O',
    location: '44 Lillian street, Toronto',
    description: 'CAPSTONE',
    start: {
      dateTime: '2022-12-17T09:00:00-07:00',
      timeZone: 'America/Toronto',
    },
    end: {
      dateTime: '2022-12-17T17:00:00-07:00',
      timeZone: 'America/Toronto',
    },
    attendees: [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 },
      ],
    },
  };
  //needs to change to req.body
  const eventId = 'personalassistantce9842c5e61c4875b333de46df739d3e';
  //save credentials from req.user
  const credential = req?.user.tokens;
  //generate oauth2client credentials based of user credential
  oauth2Client.setCredentials(credential);
  //defines calendar api call using user auth and create new event
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  calendar.events.update(
    { calendarId: 'primary', eventId: eventId, requestBody: event },
    function (err, event) {
      if (err) {
        res.json({
          event: 'There was an error contacting the Calendar service: ' + err,
        });
        return;
      }
      res.json({ event: event.data });
    }
  );
}

//Deletes an existing event from primary calendar
async function deleteEvent(req, res) {
  //needs to change to req.body
  const eventId = 'personalassistant51b993813c5341f9a68cfd67865ef154';
  //save credentials from req.user
  const credential = req?.user.tokens;
  //generate oauth2client credentials based of user credential
  oauth2Client.setCredentials(credential);
  //defines calendar api call using user auth and create new event
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  calendar.events.delete(
    { calendarId: 'primary', eventId: eventId },
    function (err, event) {
      if (err) {
        res.json({
          event: 'There was an error contacting the Calendar service: ' + err,
        });
        return;
      }
      res.json({ message: 'event successfully deleted.' });
    }
  );
}

//function that revokes access to user token
function revokeUserToken(res, req) {
  const data = req?.user.tokens;
  const revokeUrl = 'https://oauth2.googleapis.com/revoke';
  axios
    .post(
      revokeUrl,
      { token: data },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    .then((response) => {
      console.log(response);
    })
    .catch((e) => {
      console.log(e);
    });
}

module.exports = {
  authRequest,
  oauth2Callback,
  getCalendarEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  revokeUserToken,
};
