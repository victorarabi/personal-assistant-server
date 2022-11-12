var express = require('express');
const { use } = require('passport');
const router = express.Router();
var passport = require('passport');
require('dotenv').config();
const GoogleStrategy = require('passport-google-oauth2').Strategy;

//Environment variables
let clientID = process.env.GOOGLE_CLIENT_ID;
let clientSecret = process.env.GOOGLE_CLIENT_SECRET;
let callbackURL = process.env.GOOGLE_CALLBACK_URL;

console.log(clientID);
console.log(clientSecret);
console.log(callbackURL);

//function that verify if user exists on data
authUser = (request, accessToken, refreshToken, profile, done) => {
  console.log(profile);
  return done(null, profile);
};

console.log();

//Use "GoogleStrategy" as the Authentication Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      passReqToCallback: true,
    },
    authUser
  )
);

//serealize user
passport.serializeUser((user, done) => {
  // console.log('serializeUser (user object):', user);
  // Store the user id, username and name in session
  done(null, { id: user.id, username: user.username, name: user.name });
});

//deserealize user
passport.deserializeUser((user, done) => {
  // console.log('Deserialized User:', user);
  done(null, user);
});

//route to authenticate with google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

//Callback route for the authentication
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: `${process.env.CLIENT_URL}/auth-fail`,
  })
);

//logout route
router.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect(process.env.CLIENT_URL);
  });
});

module.exports = router;
