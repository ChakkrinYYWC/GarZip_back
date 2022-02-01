const passport = require('passport');
const express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  res.render('pages/index.ejs'); // load the index.ejs file
});

// router.get('/profile', isLoggedIn, function (req, res) {
//   res.render('pages/profile.ejs', {
//     user: req.user // get the user out of session and pass to template
//   });
// });

//-----------------------------------//

router.get('/auth/normal', passport.authenticate('local', {
  successRedirect: '/',
  successFlash: 'welcome',
  failureRedirect: '/',
  failureFlash: 'error'
}));

//-----------------------------------//

router.post('/auth/normal', passport.authenticate('local', {
  successRedirect: '/',
  successFlash: 'welcome',
  failureRedirect: '/',
  failureFlash: 'error'
}));

router.post("/auth/normal", function(req, res){
  if(req.body.password != req.body.c_password){
      console.log("confirm password error")
      return res.sendStatus(400)
  }
  user.register(new user({username: req.body.username}), req.body.password,function(error, user){
      if(error){
          console.log(error);
          return res.render('register')
      }
      passport.authenticate('local')(req,res,function(){
          req.flash('success','Welcome ,'+ user.username)
          res.sendStatus(201)
      })
  })
})

//-----------------------------------//

router.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['public_profile', 'email']
}));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/error'
}));
  
//-----------------------------------//

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
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