const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const {
  searchByUserId,
  searchByUsername,
  checkUser,
  createUser,
} = require('./dbController');
require('dotenv').config();

//function that verify if user exists on data and returns user data for serealization
function authUserGoogle(request, accessToken, refreshToken, profile, done) {
  let authenticatedUser = searchByUserId(profile.id);
  //Verify if there's an existing user
  if (authenticatedUser) {
    //if user exists, return the user to serealize function
    // console.log('user found on database:', userCheck);
    return done(null, authenticatedUser);
  } else {
    //if user does not exist, creates a new user
    const newUser = {
      provider: profile.provider,
      password: null,
      username: null,
      email: profile.email,
      id: profile.id,
      name: profile.displayName,
      picture: profile.picture,
      calendarAuth: false,
      tokens: {
        access_token: null,
        refresh_token: null,
        scope: null,
        token_type: null,
        id_token: null,
        expiry_date: null,
        api_key: null,
      },
    };
    createUser(newUser);
    // console.log('user created on db', newUser);
    return done(null, newUser);
  }
}

//function for local strategy that verifies if user exists on data and returns user data for serealization
async function authUserLocal(username, password, done) {
  //validates that the request is not null/blank
  if (!username || !password) {
    console.log('no user information was requested');
    return done(null, false);
  }
  //search if user exists on db
  const authenticatedUser = searchByUsername(username);
  //Verify if there's an existing user
  if (authenticatedUser) {
    const passwordMatch = await bcrypt.compare(
      password,
      authenticatedUser.password
    );
    if (passwordMatch) {
      //if user exists and passowrd is correct, return the user to serealize function
      // console.log('user found on database:', authenticatedUser);
      return done(null, authenticatedUser);
    } else {
      //if user password does not match, don't authorize
      // console.log('password is incorrect');
      return done(null, false);
    }
  } else {
    //if user does not exist don't authorize
    // console.log('user not found on database');
    return done(null, false);
  }
}

/**
 * function that signs an user up. Used with POST requests.
 */
async function signUp(req, res) {
  const { name, email, username, password } = req.body;
  if (!name && !email && !username && !password) {
    res.status(400).send('Information Missing! from the body data');
  }
  //verify if user exists on database
  const checkUserExists = checkUser(email, username);
  //create user if no match was found
  if (!checkUserExists) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = {
      provider: 'local',
      password: hashPassword,
      username: username,
      email: email,
      id: uuidv4,
      name: name,
      picture: null,
      calendarAuth: false,
      tokens: {
        access_token: null,
        refresh_token: null,
        scope: null,
        token_type: null,
        id_token: null,
        expiry_date: null,
        api_key: null,
      },
    };
    createUser(newUser);
    res.status(201).send('User succesfully created on database');
  } else if (checkUserExists === 'email and username') {
    //error handling if user exists on database.
    res.status(409).send('Email and username already exist in database');
  } else if (checkUserExists === 'email') {
    res.status(409).send('Email already exist in database');
  } else if (checkUserExists === 'username') {
    res.status(409).send('Username already exist in database');
  }
}
//function that logout from the app
function logout(req, res, next) {
  //logout from passaport session.
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect(process.env.CLIENT_URL);
  });
}

//function that informs if an user is logged into Passport Session.
function authStatus(req, res, next) {
  if (req.user) {
    res.send(true);
  } else {
    res.send(false);
  }
}

module.exports = { authUserGoogle, authUserLocal, signUp, logout, authStatus };
