const express = require('express');
const fs = require('fs');
const router = express.Router();
var passport = require('passport');
require('dotenv').config();
const GoogleStrategy = require('passport-google-oauth2').Strategy;

//Environment variables
let clientID = process.env.GOOGLE_CLIENT_ID;
let clientSecret = process.env.GOOGLE_CLIENT_SECRET;
let callbackURL = process.env.GOOGLE_CALLBACK_URL;
//db variables
let filePath = './data/users.json';
let db = [];

//loads userDatabase into db variable
fs.readFile(filePath, 'utf-8', (err, data) => {
  if (err) {
    console.log(err);
  }
  db = JSON.parse(data);
});

//function that verify if user exists on data and returns user data for serealization
authUser = (request, accessToken, refreshToken, profile, done) => {
  profile.accessToken = accessToken;
  let userCheck = [];
  //filters db to search for the user
  db.forEach((record) => {
    if (record.id === profile.id) {
      userCheck.push(record);
    }
  });
  //Verify if there's an existing user
  if (userCheck[0]) {
    //if user exists, return the user to serealize function
    console.log('user found on database:', userCheck[0]);
    return done(null, userCheck[0]);
  } else {
    //if user does not exist, creates a new user
    const newUser = {
      provider: profile.provider,
      password: null,
      username: null,
      id: profile.id,
      name: profile.displayName,
      picture: profile.picture,
      accessToken: profile.accessToken,
    };
    db.push(newUser);
    fs.writeFile(filePath, JSON.stringify(db), (err) => {
      if (err) {
        console.log('Error creating user user', err);
      }
    });
    console.log('user created on db', newUser);
    return done(null, newUser);
  }
};

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
  // Store the user id, and provider in session
  done(null, {
    id: user.id,
    provider: user.provider,
    accessToken: user.accessToken,
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
  console.log('Deserialized User:', authenticatedUser[0]);
  done(null, authenticatedUser[0]);
});

//route to authenticate with google
router.get(
  '/',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
  })
);

//Callback route for the authentication
router.get(
  '/callback',
  passport.authenticate('google', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: `${process.env.CLIENT_URL}/auth-fail`,
  })
);

module.exports = router;
