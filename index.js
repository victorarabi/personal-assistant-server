const express = require('express');
const expressSession = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const calendarRoutes = require('./routes/calendar');
const app = express();
const PORT = process.env.PORT || 5050;
require('dotenv').config();

// // Initialize HTTP Headers middleware
app.use(helmet());

// Enable CORS (with additional config options required for cookies)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

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

//test route
app.get('/', (req, res) => {
  res.json({ message: new Date().toISOString() });
});

//listen
app.listen(PORT, () => {
  console.log(`🚀 Server listening to requests on port ${PORT}!`);
});
