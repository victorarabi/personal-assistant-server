const express = require('express');
const router = express.Router();
const { authorization } = require('../middleware/middleware');
const { profileData, updateTimezone } = require('../controllers/dbController');

//get profile info - this serves as a way for the front end to verify whether the user has been logged to the app or not
router.get('/', authorization, profileData);
//POST request to update timezone
router.post('/timezone', authorization, updateTimezone);

module.exports = router;
