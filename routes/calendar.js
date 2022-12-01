const { google } = require('googleapis');
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const url = require('url');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

//environment variables
const CLIENT_ID = process.env.CALENDAR_CLIENT_ID;
const CLIENT_SECRET = process.env.CALENDAR_CLIENT_SECRET;
const REDIRECT_URL = process.env.CALENDAR_REDIRECT_URL;
const API_KEY = process.env.GOOGLE_API_KEY;

//db variables
let filePathDb = './model/users.json';
let db = [];

//loads userDatabase into db variable
fs.readFile(filePathDb, 'utf-8', (err, data) => {
  if (err) {
    console.log(err);
  }
  db = JSON.parse(data);
});

//create authClient
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

let userCredential = null;

//function that handles auth request from user
function authRequest(req, res, next) {
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
    req.user.tokens = db[indexOfUser].tokens;
    const dbUpdated = JSON.stringify(db);
    fs.writeFile(filePathDb, dbUpdated, (err) => {
      if (err) {
        console.log(err);
      }
    });
    res.json({ logged_user: db[indexOfUser].tokens });
    //logic to  redirect back to backend front page
  }
}

//function that fetches calendar data
async function getCalendarEvents(req, res, next) {
  //fetch credentials from req.user
  let userCredential = req?.user.tokens;
  //generate oauth2client credentials based of user credential
  oauth2Client.setCredentials(userCredential);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });
  const events = response.data.items;
  res.json({ events: events });
}

//authorization middleware
function checkIfLogged(req, res, next) {
  if (req.user === undefined) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

async function createEvents(req, res, next) {
  const event = {
    summary: 'Google I/O 2015',
    location: '800 Howard St., San Francisco, CA 94103',
    description: "A chance to hear more about Google's developer products.",
    start: {
      dateTime: '2022-12-01T09:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: '2022-12-02T17:00:00-07:00',
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
    creator: {
      displayName: 'personal-assistant',
    },
  };

  //will get event details based of req.body
  //fetch credentials from req.user
  let userCredential = req?.user.tokens;
  //generate oauth2client credentials based of user credential
  oauth2Client.setCredentials(userCredential);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  calendar.events.insert(
    { calendarId: req.user.email, resource: event },
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

//when use tries to authorize calendar app, they will be redirected to the authorizationUrl create above.
router.get('/auth/callback', oauth2Callback);

//callback from the authorizationUrl
router.get('/auth/request', authRequest);

//request event data
router.get('/events', checkIfLogged, getCalendarEvents);

//boilerplate get to try creating events
router.get('/events/create', checkIfLogged, createEvents);

module.exports = router;
