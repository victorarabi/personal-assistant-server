const fs = require('fs');

//reads userDatabase and loads it into db variable
let filePathDb = './model/users.json';
let db = [];
fs.readFile(filePathDb, 'utf-8', (err, data) => {
  if (err) {
    console.log(err);
  }
  db = JSON.parse(data);
});

function profileData(req, res) {
  let userData = {
    id: req.user.id,
    name: req.user.name,
    picture: req.user.picture,
    email: req.user.email,
  };
  res.send(userData);
}

module.exports = { profileData };
