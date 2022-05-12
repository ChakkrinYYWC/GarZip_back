const express = require('express');
var router = express.Router();
const book = require('../models/book');


router.get('/', function (req, res) {
    res.render('pages/login.ejs'); // load the index.ejs file
});

router.get('/search', function (req, res) {
    res.render('pages/search.ejs'); // load the index.ejs file
});

router.get('/dashboard', function (req, res) {
    res.render('pages/dashboard.ejs'); // load the index.ejs file
});

router.get('/detail', function (req, res) {
    res.render('pages/detail.ejs'); // load the index.ejs file
});

router.get('/createbook', function (req, res) {
    res.render('pages/createbook.ejs'); // load the index.ejs file
});

// router.get('/catagorybook', function (req, res) {
//     // res.render('pages/catagorybook.ejs'); // load the index.ejs file
// });
router.get('/catagorybook', (req, res) => {
    book.find((err, docs) => {
      if (!err) {
        // res.send(docs) 
        res.render('pages/catagorybook.ejs', { 'books': docs })
      } else
        console.log('Error #1 : ' + JSON.stringify(err, undefined, 2))
    })
  })

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else res.redirect('/login');
}

module.exports = router;