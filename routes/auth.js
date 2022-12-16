const express = require('express');
const fs = require('fs');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {
  authUserLocal,
  authUserGoogle,
  signUp,
  logout,
} = require('../controllers/authController');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { searchByUserId } = require('../controllers/dbController');
require('dotenv').config();

//Environment variables
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL;

//Passport setup
//Use "GoogleStrategy" as the Authentication Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      passReqToCallback: true,
    },
    authUserGoogle
  )
);
//use Local strategy for passport
passport.use(new LocalStrategy(authUserLocal));
//serealize user
passport.serializeUser((user, done) => {
  // Store the user id, and provider in session
  done(null, {
    id: user.id,
    provider: user.provider,
    tokens: user.tokens,
    timezone: user.timezone,
  });
  return;
});
//deserealize user
passport.deserializeUser((user, done) => {
  let authenticatedUser = searchByUserId(user.id);
  //filters db to search for the user based on the serealized info provided
  done(null, authenticatedUser);
  return;
});

//routes

//route to authenticate with google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);
//Callback route for the google authentication
router.get(
  '/google/callback',
  passport.authenticate('google', {
    //change to
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: `${process.env.CLIENT_URL}/auth-fail`,
  })
);
//route for local authenthication
router.post(
  '/local/login',
  passport.authenticate('local', {
    failureRedirect: '/',
  }),
  function (req, res) {
    res.send(true);
  }
);
//route to post a new user
router.post('/local/signup', signUp);
//route for logout
router.get('/logout', logout);

module.exports = router;
