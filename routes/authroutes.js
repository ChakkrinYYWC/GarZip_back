const passport = require('passport');
const express = require('express');
var router = express.Router();
const User = require('../models/user');
const book = require('../models/book');
const dashboard = require('../models/dashboard');
const JWT = require("jsonwebtoken");
const Token = require("../models/token");
const sendEmail = require("../utils/email/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const bcryptSalt = process.env.BCRYPT_SALT;
router.get('/', function (req, res) {
  res.render('pages/index.ejs'); // load the index.ejs file
});

// router.get('/profile', isLoggedIn, function (req, res) {
//   res.render('pages/profile.ejs', {
//     user: req.user // get the user out of session and pass to template
//   });
// });

//-----------------------------------//

router.get('/login', passport.authenticate('local', {
  successRedirect: '/',
  successFlash: 'welcome',
  failureRedirect: '/',
  failureFlash: 'error'
}));

router.post("/register", function (req, res) {
  if (req.body.password != req.body.c_password) {
    console.log("confirm password error")
    return res.sendStatus(400)
  }
  user.register(new user({ email: req.body.email, mode: req.body.mode, username: req.body.username}), req.body.password, function (error, user) {
    if (error) {
      console.log("1")
      console.log(error);
      return res.render('register')
    }
    passport.authenticate('local')(req, res, function () {
      res.sendStatus(201)
    })
  })
})

//-----------------------------------//

router.get('/facebooklogin', passport.authenticate('facebook', {
  scope: ['public_profile', 'email']
}));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: 'auth/error'
  }));

//-----------------------------------//

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/passwordforgotten',async function (req, res) {
  const user = await User.findOne({ email:req.body.email });

  if (!user) console.log("User does not exist")
  let token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();
  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();

  const link = `http://localhost:3000/auth/passwordReset?token=${resetToken}&id=${user._id}`;
  sendEmail(user.email,"Password Reset Request",{name: user.name,link: link,},"./template/requestResetPassword.handlebars");
  res.sendStatus(200)
  return link;
});

router.get('/error', isLoggedIn, function (req, res) {
  res.render('pages/error.ejs');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}

module.exports = router;