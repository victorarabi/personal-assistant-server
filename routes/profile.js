const express = require('express');
const router = express.Router();
const { authorization } = require('../controllers/middlewareController');
const { profileData } = require('../controllers/dbController');

//get profile info - this serves as a way for the front end to verify whether the user has been logged to the app or not
router.get('/', authorization, profileData);

module.exports = router;
