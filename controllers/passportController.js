const {
  searchByUserId,
  searchByUsername,
  createUser,
} = require('../controllers/dbController');

//function that verify if user exists on data and returns user data for serealization
function authUserGoogle(request, accessToken, refreshToken, profile, done) {
  let userCheck = searchByUserId(profile.id);
  //Verify if there's an existing user
  if (userCheck) {
    //if user exists, return the user to serealize function
    // console.log('user found on database:', userCheck);
    return done(null, userCheck);
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
function authUserLocal(username, password, done) {
  console.log(username, password);
  //validates that the request is not null/blank
  if (!username || !password) {
    console.log('no user information was requested');
    return done(null, false);
  }
  //search if user exists on db
  const authenticatedUser = searchByUsername(username);
  //Verify if there's an existing user
  if (authenticatedUser) {
    if (authenticatedUser.password === password) {
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

module.exports = { authUserGoogle, authUserLocal, logout };
