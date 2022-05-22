const express = require('express');
const router = express.Router();
const book = require('../models/book');
const passport = require('passport');
const User = require('../models/user');
const Chart = require('../models/chart');
const mongoose = require("mongoose");

router.get('/', function (req, res) {
    // console.log(req.session)
    res.render('pages/login.ejs'); // load the index.ejs file
});

router.get('/dashboardsearch', isLoggedIn, async function (req, res) {
    let found_book_name = await book.aggregate([
        {
            $addFields: {
                result: {
                    $regexMatch: {
                        input: "$name",
                        regex: "",
                        options: "i"
                    }
                }
            }
        },
        {
            $match: {
                "result": true
            }
        },
    ])
    let fonud_book_auther = await book.aggregate([
        {
            $addFields: {
                result: {
                    $regexMatch: {
                        input: "$auther",
                        regex: "",
                        options: "i"
                    }
                }
            }
        },
        {
            $match: {
                "result": true
            }
        },
    ])
    const result = { found_book_name, fonud_book_auther }
    return res.render("pages/search.ejs", { data: result, searchtext: "all", catagory: "ทั้งหมด" })
});
router.post("/dashboardsearch", isLoggedIn, async function (req, res) {
    var info = req.body.info
    if (req.body.info === '') {
        info = 'all'
    }
    if (info == 'all') {
        var found_book_name = await book.aggregate([
            {
                $addFields: {
                    result: {
                        $regexMatch: {
                            input: "$name",
                            regex: "",
                            options: "i"
                        }
                    }
                }
            },
            {
                $match: {
                    "result": true
                }
            },
        ])
        var fonud_book_auther = await book.aggregate([
            {
                $addFields: {
                    result: {
                        $regexMatch: {
                            input: "$auther",
                            regex: "",
                            options: "i"
                        }
                    }
                }
            },
            {
                $match: {
                    "result": true
                }
            },
        ])
    } else {
        var found_book_name = await book.aggregate([
            {
                $addFields: {
                    result: {
                        $regexMatch: {
                            input: "$name",
                            regex: info,
                            options: "i"
                        }
                    }
                }
            },
            {
                $match: {
                    "result": true
                }
            },
        ])
        var fonud_book_auther = await book.aggregate([
            {
                $addFields: {
                    result: {
                        $regexMatch: {
                            input: "$auther",
                            regex: info,
                            options: "i"
                        }
                    }
                }
            },
            {
                $match: {
                    "result": true
                }
            },
        ])
    }
    const result = { found_book_name, fonud_book_auther }
    return res.render("pages/search.ejs", { data: result, searchtext: info, catagory: "ทั้งหมด"  })
})

router.get("/dashboardsearch/:info/:catagory", isLoggedIn, async function (req, res) {
    var info = req.params.info
    const catagory = req.params.catagory
    if (info == 'all') {
        var found_book_name = await book.aggregate([
            {
                $addFields: {
                    result: {
                        $regexMatch: {
                            input: "$name",
                            regex: "",
                            options: "i"
                        }
                    }
                }
            },
            {
                $match: {
                    "result": true,
                    category: catagory
                }
            }
        ])
        var fonud_book_auther = await book.aggregate([
            {
                $addFields: {
                    result: {
                        $regexMatch: {
                            input: "$auther",
                            regex: "",
                            options: "i"
                        }
                    }
                }
            },
            {
                $match: {
                    "result": true,
                    category: catagory
                }
            }
        ])
    } else {
        var found_book_name = await book.aggregate([
            {
                $addFields: {
                    result: {
                        $regexMatch: {
                            input: "$name",
                            regex: info,
                            options: "i"
                        }
                    }
                }
            },
            {
                $match: {
                    "result": true,
                    category: catagory
                }
            },
        ])
        var fonud_book_auther = await book.aggregate([
            {
                $addFields: {
                    result: {
                        $regexMatch: {
                            input: "$auther",
                            regex: info,
                            options: "i"
                        }
                    }
                }
            },
            {
                $match: {
                    "result": true,
                    category: catagory
                }
            },
        ])
    }
    const result = { found_book_name, fonud_book_auther }
    return res.render("pages/search.ejs", { data: result, searchtext: info, catagory: catagory })
})

router.get('/dashboard', isLoggedIn, async function (req, res) {
    const playandregist = await Chart.aggregate([
        {
            $match: {
                name: 'select'
            }
        },
    ])
    const normaluser = await User.aggregate([
        {
            $match: {
                mode: false
            }
        },
    ])
    const blinduser = await User.aggregate([
        {
            $match: {
                mode: true
            }
        },
    ])
    res.render('pages/dashboard.ejs', { playandregist: playandregist[0], normaluser: normaluser.length, blinduser: blinduser.length });
});

router.post('/dashboard', isLoggedIn, async function (req, res) {
    const playandregist = await Chart.aggregate([
        {
            $match: {
                name: 'select'
            }
        },
    ])
    const normaluser = await User.aggregate([
        {
            $match: {
                mode: false
            }
        },
    ])
    const blinduser = await User.aggregate([
        {
            $match: {
                mode: true
            }
        },
    ])
    const data = [playandregist[0], normaluser, blinduser]
    return res.status(200).send(data)
});

router.post('/detail', isLoggedIn, async function (req, res) {
    // console.log(req.body.info)
    let found_book_id = await book.aggregate([
        {
            $match: {
                "_id": mongoose.Types.ObjectId(req.body.info)
            }
        },
    ])
    console.log(found_book_id[0].chapter)
    res.render('pages/detail.ejs', { data: found_book_id, chapter: found_book_id[0].chapter });
});

router.get('/createbook', isLoggedIn, function (req, res) {
    res.render('pages/createbook.ejs');
});

router.get('/catagorybook', isLoggedIn, (req, res) => {
    book.find((err, docs) => {
        if (!err) {
            // res.send(docs) 
            
            res.render('pages/catagorybook.ejs', { 'books': docs, 'title': 'ทั้งหมด' })
        } else
            console.log('Error #1 : ' + JSON.stringify(err, undefined, 2))
    })
})

router.get('/catagorybook/:name', isLoggedIn, (req, res) => {
    // console.log(req.params.name)
    book.find({ category: req.params.name }, (err, docs) => {
        if (!err) {
            // res.send(docs)
            console.log(docs)
            res.render('pages/catagorybook.ejs', { 'books': docs, 'title': req.params.name })
        } else
            console.log('Error #1 : ' + JSON.stringify(err, undefined, 2))
    })
})



router.post('/login', isAdmin, (req, res, next) => {
    User.findOne({ username: req.body.username }, async function (err, found) {
        req.login(found, async (err) => {
            if (err) {
                console.log(err)
                return next();
            }
            return res.redirect('/dashboard');
        })
    });
});
router.get('/logout', async (req, res, next) => {
    req.logout();
    return res.redirect('/');
});

router.get('/playcount', async function (req, res) {
    const chartdata = await Chart.aggregate([
        {
            $match: {
                name: 'select'
            }
        }
    ])
    const numply = chartdata[0].play
    const numberplay = numply + 1
    await Chart.findOneAndUpdate({ name: 'select' }, { play: numberplay });
    return res.status(200)
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else {
        console.log('Block by isLoggedIn')
        return res.redirect('/');
    }
}

function isAdmin(req, res, next) {
    User.findOne({ username: req.body.username }, async function (error, found) {
        // console.log(found.permission)
        if (found.permission == 'admin') {
            return next();
        }
        else {
            console.log('Block by isAdmin')
            return res.redirect('/');
        }
    });
}

module.exports = router;