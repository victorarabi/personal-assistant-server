const express = require('express');
const expressSession = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const calendarRoutes = require('./routes/calendar');
const { searchByUserId } = require('./controllers/dbController');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5050;

// // Initialize HTTP Headers middleware
app.use(helmet());

// Enable CORS (with additional config options required for cookies)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
// Include express-session middleware (with additional config options required for Passport session)
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport middleware
app.use(passport.initialize());
// Passport.session middleware alters the `req` object with the `user` value based of session
app.use(passport.session());

//routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/calendar', calendarRoutes);

//test - DELETE
app.get('/', (req, res) => {
  const test = new Date(1669848856626);
  const test1 = new Date(1670372128974);
  const comparetest = (date) => {
    const today = new Date();
    if (today > date) {
      return true;
    } else {
      return false;
    }
  };
  const compare = comparetest(test1);
  console.log(test1);
  res.json({ message: compare });
});

//listen to requests
app.listen(PORT, () => {
  console.log(`🚀 Server listening to requests on port ${PORT}!`);
});
