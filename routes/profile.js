const express = require('express');
const fs = require('fs');
const router = express.Router();

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
//get request
router.use((req, res, next) => {
  if (req.user === undefined) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
});

router.get('/', (req, res) => {
  let userData = {
    id: req.user.id,
    name: req.user.name,
    picture: req.user.picture,
    accessToken: req.user.accessToken,
    email: req.user.email,
  };
  res.send(userData);
});

module.exports = router;
