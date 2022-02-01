const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const passportlocal = require('passport-local')
const FacebookStrategy = require('passport-facebook').Strategy;
const authroutes = require('./routes/authroutes.js');
const config = require('./config')

app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET'
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

passport.use(new passportlocal(user.authenticate()))

passport.use(new FacebookStrategy({
    clientID: config.facebookAuth.clientID,
    clientSecret: config.facebookAuth.clientSecret,
    callbackURL: config.facebookAuth.callbackURL
  }, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

app.use('/', authroutes);

const port = 3000;

app.listen(port, () => {
  console.log('App listening on port ' + port);
});