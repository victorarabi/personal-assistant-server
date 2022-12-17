const express = require('express');
const router = express.Router();
const { authorization } = require('../middleware/middleware');
const {
  authRequest,
  oauth2Callback,
  getCalendarEvents,
  createEvent,
  createSecondaryEvent,
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
//POST request to create new prime events
router.post('/events/create', authorization, createEvent);
//POST request to create new secondary events
router.post('/events/create-secondary', authorization, createSecondaryEvent);
//boilerplate get to update event - WIP will change to POST
router.get('/events/update', authorization, updateEvent);
//DELETE request to delete 1 or more events
router.delete('/events/delete/:id', authorization, deleteEvent);
module.exports = router;
