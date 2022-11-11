const express = require('express');
const expressSession = require('express-session');
const cors = require('cors');
// const helmet = require('helmet');
const passport = require('passport');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// // Initialize HTTP Headers middleware
// app.use(helmet());

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
// =========== Passport Config ============

// Initialize Passport middleware
app.use(passport.initialize());
// Passport.session middleware alters the `req` object with the `user` value
app.use(passport.session());

const authRoutes = require('./routes/auth');

app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}.`);
});
