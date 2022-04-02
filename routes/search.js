const passport = require('passport');
const express = require('express');
var router = express.Router();
const User = require('../models/user');
const Book = require('../models/book')


router.post("/:info", async function (req, res) {
    const info = req.params.info
    let found_book_name = await Book.aggregate([
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
    let fonud_book_auther = await Book.aggregate([
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
    const result = { found_book_name, fonud_book_auther }
    if(result.found_book_name.length ==0 && result.fonud_book_auther.length == 0){
        res.status(200).send("Not found")
    }else{
        res.status(200).send(result)
    }
})

module.exports = router;