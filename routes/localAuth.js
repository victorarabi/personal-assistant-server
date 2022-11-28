var express = require('express');
const fs = require('fs');
const router = express.Router();
var passport = require('passport');
require('dotenv').config();
const LocalStrategy = require('passport-local').Strategy;
//db variables
let filePath = './model/users.json';
let db = [];

//loads userDatabase into db variable
fs.readFile(filePath, 'utf-8', (err, data) => {
  if (err) {
    console.log(err);
  }
  db = JSON.parse(data);
});

//function that verify if user exists on data and returns user data for serealization
authUser = (user, password, done) => {
  //validates that the request is not null/blank
  if (!user || !password) {
    console.log('no user information was requested');
    return done(null, false);
  }
  let authenticatedUser = [];
  //filters db to search for the user
  db.forEach((record) => {
    if (record.username === user) {
      authenticatedUser.push(record);
    }
  });
  //Verify if there's an existing user
  if (authenticatedUser[0]) {
    if (authenticatedUser[0].password === password) {
      //if user exists and passowrd is correct, return the user to serealize function
      console.log('user found on database:', authenticatedUser[0]);
      return done(null, authenticatedUser[0]);
    } else {
      //if user password does not match, don't authorize
      console.log('password is incorrect');
      return done(null, false);
    }
  } else {
    //if user does not exist don't authorize
    console.log('user not found on database');
    return done(null, false);
  }
};

//use Local strategy for passport
passport.use(new LocalStrategy(authUser));

//serealize user
passport.serializeUser((user, done) => {
  // Store the user id, and provider in session
  done(null, { id: user.id, provider: user.provider });
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

router.get(
  '/login',
  passport.authenticate('local', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: `${process.env.CLIENT_URL}/auth-fail`,
  })
);

module.exports = router;
