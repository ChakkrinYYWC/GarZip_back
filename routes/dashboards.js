const express = require('express');
const router = express.Router();
const book = require('../models/book');
const passport = require('passport');
const User = require('../models/user');

router.get('/', function (req, res) {
    console.log(req.session)
    res.render('pages/login.ejs'); // load the index.ejs file
});

router.get('/search', function (req, res) {
    res.render('pages/search.ejs'); // load the index.ejs file
});

router.get('/dashboard',isLoggedIn, function (req, res) {
    console.log(req.session)
    res.render('pages/dashboard.ejs');
});

router.get('/detail', function (req, res) {
    res.render('pages/detail.ejs'); 
});

router.get('/createbook', function (req, res) {
    res.render('pages/createbook.ejs');
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

router.post('/login', isAdmin,(req, res, next)=> {
    User.findOne({username: req.body.username}, async function(err, found){
        req.login(found,async (err) => {
            if (err) { 
                console.log(err)
                return next(); 
            }
            return res.redirect('/dashboard'); 
          })
    });
});
router.get('/logout',async(req, res, next) => {
    req.logout();
    return res.redirect('/'); 
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else{
        console.log('Block by isLoggedIn')
        return res.redirect('/');
    }
}

function isAdmin(req, res, next) {
    User.findOne({username: req.body.username}, async function(error, found){
        // console.log(found.permission)
        if (found.permission == 'admin'){
            return next();
        }
        else{
            console.log('Block by isAdmin')
            return res.redirect('/');
        }
    });
}

module.exports = router;