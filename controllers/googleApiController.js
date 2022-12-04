const { google } = require('googleapis');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

//environment variables
const CLIENT_ID = process.env.CALENDAR_CLIENT_ID;
const CLIENT_SECRET = process.env.CALENDAR_CLIENT_SECRET;
const REDIRECT_URL = process.env.CALENDAR_REDIRECT_URL;
const API_KEY = process.env.GOOGLE_API_KEY;
const CLIENT_URL = process.env.CLIENT_URL;
const DB_PATH = process.env.DB_PATH;

//reads userDatabase and loads it into db variable
let db = [];
fs.readFile(DB_PATH, 'utf-8', (err, data) => {
  if (err) {
    console.log(err);
  }
  db = JSON.parse(data);
});

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
    //fetches user from db based of logged user info
    const indexOfUser = db.findIndex((user) => {
      if (user.email == req?.user.email) {
        return true;
      } else {
        return false;
      }
    });
    //checks if it is the first request, then save credentials with refresh_token -> that only happens on the first time in which the user provides access to the app.
    if (userCredential.refresh_token) {
      db[indexOfUser].calendarAuth = true;
      db[indexOfUser].tokens.access_token = userCredential.access_token;
      db[indexOfUser].tokens.refresh_token = userCredential.refresh_token;
      db[indexOfUser].tokens.scope = userCredential.scope;
      db[indexOfUser].tokens.token_type = userCredential.token_type;
      db[indexOfUser].tokens.id_token = userCredential.id_token;
      db[indexOfUser].tokens.expiry_date = userCredential.expiry_date;
      db[indexOfUser].tokens.api_key = API_KEY;
    } else {
      //if has already authorized the app, google auth2 server will not send refresh token
      db[indexOfUser].calendarAuth = true;
      db[indexOfUser].tokens.access_token = userCredential.access_token;
      db[indexOfUser].tokens.scope = userCredential.scope;
      db[indexOfUser].tokens.token_type = userCredential.token_type;
      db[indexOfUser].tokens.id_token = userCredential.id_token;
      db[indexOfUser].tokens.expiry_date = userCredential.expiry_date;
      db[indexOfUser].tokens.api_key = API_KEY;
    }
    //saves tokens to req.user
    req.user.tokens = db[indexOfUser].tokens;
    const dbUpdated = JSON.stringify(db);
    fs.writeFile(filePathDb, dbUpdated, (err) => {
      if (err) {
        console.log(err);
      }
    });
    console.log('User tokens:' + db[indexOfUser].tokens);
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
  res.json({ events: userEvents });
}

async function createEvents(req, res, next) {
  const summary = req.body.summary;
  const description = req.body.description;
  const location = req.body.location;
  //generates uniqueid for event
  const uuid = uuidv4();
  let newId = uuid.split('-');
  newId = newId.join('');
  const eventId = 'personalassistant' + newId;
  const event = {
    summary: 'Google I/O 2022',
    id: eventId,
    location: '800 Howard St., San Francisco, CA 94103',
    description: "A chance to hear more about Google's developer products.",
    start: {
      dateTime: '2022-12-05T09:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: '2022-12-05T17:00:00-07:00',
      timeZone: 'America/Los_Angeles',
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
        res.json({
          event: 'There was an error contacting the Calendar service: ' + err,
        });
        return;
      }
      res.json({ event: event.data });
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
  createEvents,
  revokeUserToken,
};
