const express = require('express');
var router = express.Router();


router.get('/', function (req, res) {
    res.render('pages/login.ejs'); // load the index.ejs file
});

router.get('/search', function (req, res) {
    res.render('pages/search.ejs'); // load the index.ejs file
});

router.get('/dashboard', function (req, res) {
    res.render('pages/dashboard.ejs'); // load the index.ejs file
});

router.get('/user', function (req, res) {
    res.render('pages/user.ejs'); // load the index.ejs file
});

router.get('/createbook', function (req, res) {
    res.render('pages/createbook.ejs'); // load the index.ejs file
});

router.get('/catagorybook', function (req, res) {
    res.render('pages/catagorybook.ejs'); // load the index.ejs file
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else res.redirect('/login');
}

module.exports = router;