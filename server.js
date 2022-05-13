const express = require('express');
const router = express.Router();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const passportlocal = require('passport-local')
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const flash = require("connect-flash")
const cors = require("cors");
const authroutes = require('./routes/authroutes.js'),
  books = require('./routes/books.js'),
  // Book = require('./models/book');
  userdata = require('./routes/userdata'),
  search = require('./routes/search');
dashboards = require('./routes/dashboards.js');
const config = require('./config')
const mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  app = express(),
  user = require('./models/user');

app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
app.use(flash())

mongoose.connect('mongodb+srv://garzip:uR7lntmgguFvOFQ8@cluster0.ihy1b.mongodb.net/Garzip?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    if (!err)
      console.log('Mongodb connection succeeded.')
    else
      console.log('Error while connecting MongoDB : ' + JSON.stringify(err, undefined, 2))
  });

app.use(session({
  secret: 'SECRET',
  saveUninitialized: true,
  resave: true,
  // using store session on MongoDB using express-session + connect
  store: MongoStore.create({
    mongoUrl: config.urlMongo
})
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new FacebookStrategy({
  clientID: config.facebookAuth.clientID,
  clientSecret: config.facebookAuth.clientSecret,
  callbackURL: config.facebookAuth.callbackURL
}, function (accessToken, refreshToken, profile, done) {
  return done(null, profile);
}
));

// passport.use(new LocalStrategy({ usernameField: 'email' },
//   (email, password, done) => {
//     console.log('Inside local strategy callback')
//     // here is where you make a call to the database
//     // to find the user based on their username or email address
//     // for now, we'll just pretend we found that it was users[0]
//     const user = users[0]
//     if (email === user.email && password === user.password) {
//       console.log('Local strategy returned true')
//       return done(null, user)
//     }
//   }
// ));

passport.use(new LocalStrategy(
  function (username, password, done) {
    user.findOne({ 'username': username }, function (err, user) {
      if (err) return done(err, { message: "wrong roll_number or password" });//wrong roll_number or password; 
      if (user) return done(null, user);
    });
  }
));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

app.use(cors());

passport.use(new passportlocal(user.authenticate()))

app.use('/auth', authroutes);
app.use('/book', books);
app.use('/user', userdata)
app.use('/search', search)
app.use('/', dashboards)


const port = 3000;

app.listen(port, () => {
  console.log('App listening on port ' + port);
});