const express = require('express');
const session = require('express-session');
const passport = require('passport');
const passportlocal = require('passport-local')
const FacebookStrategy = require('passport-facebook').Strategy;
const flash = require("connect-flash")
const cors = require("cors");
const authroutes = require('./routes/authroutes.js'),
      books = require('./routes/books.js'),
      userdata = require('./routes/userdata')
      dashboards = require('./routes/dashboards.js');
const config = require('./config')
const mongoose = require("mongoose"),
      bodyParser = require("body-parser"),
      app = express(), 
      user = require('./models/user');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(flash())
// app.use(express.urlencoded());

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET'
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());

mongoose.connect('mongodb+srv://garzip:uR7lntmgguFvOFQ8@cluster0.ihy1b.mongodb.net/Garzip?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true },
    err => {
        if (!err)
            console.log('Mongodb connection succeeded.')
        else
            console.log('Error while connecting MongoDB : ' + JSON.stringify(err, undefined, 2))
    });

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

app.use('/auth', authroutes);
app.use('/book', books);
app.use('/user', userdata)
// app.use('/dashboard', dashboards);

const port = 3000;

app.listen(port, () => {
  console.log('App listening on port ' + port);
});