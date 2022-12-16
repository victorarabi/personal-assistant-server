const fs = require('fs');
require('dotenv').config();

//environment
const API_KEY = process.env.GOOGLE_API_KEY;
const DB_PATH = process.env.DB_PATH;

//reads userDatabase and loads it into db variable
let db = [];
fs.readFile(DB_PATH, 'utf-8', (err, data) => {
  if (err) {
    console.log(err);
  }
  db = JSON.parse(data);
});

//search by user id
function searchByUserId(userId) {
  const user = db.filter((record) => {
    if (record.id === userId) {
      return true;
    } else {
      return false;
    }
  });
  if (user[0]) {
    return user[0];
  } else {
    return null;
  }
}

//search by username
function searchByUsername(username) {
  const user = db.filter((record) => {
    if (record.username === username) {
      return true;
    } else {
      return false;
    }
  });
  if (user[0]) {
    return user[0];
  } else {
    return null;
  }
}

//function that verifies if user exists on the db
function checkUser(email, username) {
  const checkEmail = db.filter((record) => {
    if (record.email === email) {
      return true;
    } else {
      return false;
    }
  });
  let checkUsername = searchByUsername(username);
  if (checkEmail[0]) {
    if (checkUsername) {
      return 'email and username';
    }
    return 'email';
  } else if (checkUsername) {
    return 'username';
  } else {
    return false;
  }
}

//create a new user on the db
function createUser(newUser) {
  db.push(newUser);
  fs.writeFile(DB_PATH, JSON.stringify(db), (err) => {
    if (err) {
      console.log('Error creating user user', err);
    }
  });
}

//add tokens to user on the db
function addTokensToUser(id, userCredential) {
  const indexOfUser = db.findIndex((user) => {
    if (user.id == id) {
      return true;
    } else {
      return false;
    }
  });
  db[indexOfUser].calendarAuth = true;
  db[indexOfUser].tokens.access_token = userCredential.access_token;
  db[indexOfUser].tokens.refresh_token = userCredential.refresh_token;
  db[indexOfUser].tokens.scope = userCredential.scope;
  db[indexOfUser].tokens.token_type = userCredential.token_type;
  db[indexOfUser].tokens.id_token = userCredential.id_token;
  db[indexOfUser].tokens.expiry_date = userCredential.expiry_date;
  db[indexOfUser].tokens.api_key = API_KEY;
  fs.writeFile(DB_PATH, JSON.stringify(db), (err) => {
    if (err) {
      console.log('Error updating user database', err);
    }
  });
}

//function that update user tokens
function updateUserTokens(id, userCredential) {
  const indexOfUser = db.findIndex((user) => {
    if (user.id == id) {
      return true;
    } else {
      return false;
    }
  });
  db[indexOfUser].tokens.access_token = userCredential.access_token;
  db[indexOfUser].tokens.scope = userCredential.scope;
  db[indexOfUser].tokens.token_type = userCredential.token_type;
  db[indexOfUser].tokens.id_token = userCredential.id_token;
  db[indexOfUser].tokens.expiry_date = userCredential.expiry_date;
  fs.writeFile(DB_PATH, JSON.stringify(db), (err) => {
    if (err) {
      console.log('Error updating user database', err);
    }
  });
}

//function that updates user event data with prime event id
function updateUserPrimeEvents(id, eventId) {
  const indexOfUser = db.findIndex((user) => {
    if (user.id == id) {
      return true;
    } else {
      return false;
    }
  });
  db[indexOfUser].events = [
    ...db[indexOfUser].events,
    { primeEventId: eventId, secondaryEvents: [] },
  ];
  fs.writeFile(DB_PATH, JSON.stringify(db), (err) => {
    if (err) {
      console.log('Error updating user database', err);
    }
  });
}

//function that loads user data
function profileData(req, res) {
  const user = searchByUserId(req.user.id);
  let userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    calendarAuth: user.calendarAuth,
    tokenExpiryDate: user.tokens.expiry_date,
  };
  res.send(userData);
}

module.exports = {
  searchByUserId,
  searchByUsername,
  checkUser,
  createUser,
  addTokensToUser,
  updateUserTokens,
  updateUserPrimeEvents,
  profileData,
};
