const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const router = express.Router();
const googleCalendar = require('../controllers/googleCalendar');

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

//authorization middleware
router.use((req, res, next) => {
  if (req.user === undefined) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
});

//get req
router.get('/', (req, res) => {
  let userData = {
    id: req.user.id,
    name: req.user.name,
    picture: req.user.picture,
    email: req.user.email,
  };
  res.send(userData);
});

module.exports = router;
