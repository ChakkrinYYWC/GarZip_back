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
const mongoose = require('mongoose');
const bcryptSalt = 10;
router.get('/', function (req, res) {
  // res.render('pages/index.ejs'); // load the index.ejs file
});

// router.get('/profile', isLoggedIn, function (req, res) {
//   res.render('pages/profile.ejs', {
//     user: req.user // get the user out of session and pass to template
//   });
// });

//-----------------------------------//

// router.post('/login', passport.authenticate('local', { successFlash: 'Welcome!' }), async function (req, res, next) {
//   const user = await User.aggregate([
//     {
//       $match: {
//         username: req.body.username
//       }
//     },
//     {
//       $project: {
//         "salt": 0,
//         "hash": 0
//       }
//     }
//   ])
//   res.status(200).send(user)
// });

router.post('/login', (req, res, next) => {
  console.log('Inside POST /login callback')
  passport.authenticate('local', async function(err, user, info){
    if(err){
      console.log(err)
    }
    console.log('Inside passport.authenticate() callback');
    // console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
    // console.log(`req.user: ${JSON.stringify(req.user)}`)
    req.login(user,async (err) => {
      if (err) { return next(err); }
      console.log(req.isAuthenticated())
      console.log('Inside req.login() callback')
      // console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
      // console.log(`req.user: ${JSON.stringify(req.user)}`)
      const user = await User.aggregate([
        {
          $match: {
            username: req.body.username
          }
        },
        {
          $project: {
            "salt": 0,
            "hash": 0,
            "__v": 0
          }
        }
      ])
      // console.log(req.session)
      return res.status(200).send(user)
      // return res.redirect('localhost:8100/HOME');
      // return res.redirect(200, '${CLIENT_URL}/HOME')
      // return res.writeHead(200, {'Location': 'http://localhost:8100/' + 'HOME'});
    })
  })(req, res, next);
})

router.post("/register", function (req, res) {
  if (req.body.password != req.body.c_password) {
    return res.Status(400).send("confirm password error")
  }
  User.register(new User({ email: req.body.email, mode: req.body.mode, username: req.body.username }), req.body.password, function (error, user) {
    if (error) {
      console.log(error);
      res.status(400).send("A user with the given username is already registered")
    }
    passport.authenticate('local', { successFlash: 'Welcome!' })(req, res, function () {
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
});

//-----------------------------------//

router.post('/passwordforgotten', async function (req, res) {
  const user = await User.findOne({ email: req.body.email });
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

  const link = `http://localhost:3000/auth/confirmresetpassword/${resetToken}/${user._id}`;
  sendEmail(user.email, "Password Reset Request", { name: user.username, link: link, }, "./templates/requestResetPassword.handlebars");
  res.sendStatus(200)
  return link;
});

//-----------------------------------//
router.get('/confirmresetpassword/:token/:id', function (req, res) {
  const token = req.params.token
  const id = req.params.id
  res.render('pages/resetpassword.ejs', { token: token, id: id })
})
//-----------------------------------//

router.post('/passwordReset/:token/:id', async function (req, res) {
  console.log(req.params.token)
  if (req.body.password !== req.body.c_password) {
    res.send("Your repeat password was incorrect. Please try again").status(400)
  } else {
    let targetuser = await User.findOne({ _id: req.params.id });
    let passwordResetToken = await Token.findOne({ userId: req.params.id });
    if (!passwordResetToken) {
      throw new Error("Invalid or expired password reset token");
    }
    const isValid = await bcrypt.compare(req.params.token, passwordResetToken.token);
    if (!isValid) {
      throw new Error("Invalid or expired password reset token");
    }
    targetuser.setPassword(req.body.password, async function (err, user) {
      if (err) {
        console.log(err)
      }
      await targetuser.save()
      await passwordResetToken.deleteOne();
      res.send("Your password has been changed.").status(200)
    });
  }
  return true;
});

//-----------------------------------//

router.get('/error', isLoggedIn, function (req, res) {
  res.render('pages/error.ejs');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  else res.redirect('/login');
}

module.exports = router;