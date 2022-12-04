const express = require('express');
const fs = require('fs');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {
  authUserLocal,
  authUserGoogle,
  logout,
} = require('../controllers/passportController');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
require('dotenv').config();

//Environment variables
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL;

//reads userDatabase and loads it into db variable
const filePathDb = './model/users.json';
let db = [];
fs.readFile(filePathDb, 'utf-8', (err, data) => {
  if (err) {
    console.log(err);
  }
  db = JSON.parse(data);
});

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
  });
});

//deserealize user
passport.deserializeUser((user, done) => {
  let authenticatedUser = [];
  //filters db to search for the user based on the serealized info provided
  db.forEach((record) => {
    if (record.provider === user.provider && record.id === user.id) {
      authenticatedUser.push(record);
    }
  });
  done(null, authenticatedUser[0]);
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
router.get(
  'local/login',
  passport.authenticate('local', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: `${process.env.CLIENT_URL}/auth-fail`,
  })
);

//route for logout
router.get('/logout', logout);

module.exports = router;
