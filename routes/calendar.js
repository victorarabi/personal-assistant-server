const express = require('express');
const router = express.Router();
const { authorization } = require('../middleware/middleware');
const {
  authRequest,
  oauth2Callback,
  getCalendarEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  revokeUserToken,
} = require('../controllers/googleApiController');

//Auth routes

//auth route for google calendar api
router.get('/auth/request', authorization, authRequest);
//callback from the authorizationUrl
router.get('/auth/callback', oauth2Callback);
//revoke access to user data
router.get('/auth/revoke', authorization, revokeUserToken);

//calendar data routes

//request event data
router.get('/events', authorization, getCalendarEvents);
//boilerplate get to try creating events - WIP will change to POST
router.post('/events/create', authorization, createEvent);
//boilerplate get to update event - WIP will change to POST
router.get('/events/update', authorization, updateEvent);
//boilerplate get to delete events - WIP will change to POST.
router.get('/events/delete', authorization, deleteEvent);

module.exports = router;
