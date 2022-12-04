const fs = require('fs');

//function that verify if user exists on data and returns user data for serealization
export function authUserGoogle(
  request,
  accessToken,
  refreshToken,
  profile,
  done
) {
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
    // console.log('user found on database:', userCheck[0]);
    return done(null, userCheck[0]);
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
    db.push(newUser);
    fs.writeFile(filePath, JSON.stringify(db), (err) => {
      if (err) {
        console.log('Error creating user user', err);
      }
    });
    // console.log('user created on db', newUser);
    return done(null, newUser);
  }
}

//function for local strategy that verifies if user exists on data and returns user data for serealization
export function authUserLocal(user, password, done) {
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
}

//function that logout from the app
export function logout(req, res, next) {
  //logout from passaport session.
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect(process.env.CLIENT_URL);
  });
}
