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

//when use tries to authorize calendar app, they will be redirected to the authorizationUrl create above.
router.get('/auth/request', authRequest);
//callback from the authorizationUrl
router.get('/auth/callback', oauth2Callback);
//revoke access to user data
router.get('/auth/revoke', authorization, revokeUserToken);
//request event data
router.get('/events', authorization, getCalendarEvents);
//boilerplate get to try creating events - WIP will change to POST
router.get('/events/create', authorization, createEvent);
//boilerplate get to update event - WIP will change to POST
router.get('/events/update', authorization, updateEvent);
//boilerplate get to delete events - WIP will change to POST.
router.get('/events/delete', authorization, deleteEvent);

module.exports = router;
