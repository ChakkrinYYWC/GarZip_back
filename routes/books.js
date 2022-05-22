const passport = require('passport'),
  express = require('express'),
  book = require('../models/book'),
  User = require('../models/user');
moment = require("moment");
const mongoose = require("mongoose");
const { async } = require('q');
const crypto = require("crypto");
const crypto_id = crypto.randomBytes(16).toString("hex");

var router = express.Router();

router.get('/', (req, res) => {
  book.find((err, docs) => {
    if (!err) {
      // res.send(docs) 
      res.render('book.ejs', { 'books': docs })
    } else
      console.log('Error #1 : ' + JSON.stringify(err, undefined, 2))
  })
})

router.post('/', async (req, res) => {
  console.log('#SAVE')
  // console.log(req.body.book_id)
  // console.log('category :: ' + req.body.category)
  var newRecord = new book({
    book_id: req.body.book_id,
    name: req.body.name,
    auther: req.body.auther,
    trailer: req.body.trailer,
    text: req.body.text,
    image: req.body.image,
    category: req.body.category,
    view: 0,
  })
  console.log(newRecord)
  newRecord.save((err, docs) => {
    if (!err) {
      console.log("save successful");
      res.redirect('/book')
    } else
      console.log('Error #2 : ' + JSON.stringify(err, undefined, 2))
  })
})
router.post('/chapter/:id', async (req, res) => {
  console.log('#SAVE Chapter')
  console.log('book_id:: ', req.params.id)
  var newChapter = {
    _id: crypto_id,
    name: req.body.name,
    image: req.body.image,
    text: req.body.text,
  }
  // console.log(newChapter)
  // console.log(crypto_id)
  book.findByIdAndUpdate(req.params.id, { $addToSet: { chapter: newChapter } }, async function (error, update) {
    if (!error) {
      console.log(update)
      console.log('add new chapter')
      let found_book_id = await book.aggregate([
        {
          $match: {
            "_id": mongoose.Types.ObjectId(req.params.id)
          }
        },
      ])
      console.log(found_book_id[0].chapter)
      res.render('pages/detail.ejs', { data: found_book_id, chapter: found_book_id[0].chapter });
    } else {
      console.log('Error #2 : ' + JSON.stringify(error, undefined, 2))
    }
  })
})


router.post('/updatebook/:id', (req, res) => {
  console.log(req.params.id)
  console.log('#EDIT')
  var updatedRecord = {
    book_id: req.body.book_id,
    name: req.body.name,
    auther: req.body.auther,
    image: req.body.image,
    trailer: req.body.trailer,
    text: req.body.text,
    category: req.body.category,
  }
  console.log(updatedRecord)
  book.findByIdAndUpdate(req.params.id, { $set: updatedRecord }, { new: true }, async (err, docs) => {
    if (!err) {
      console.log("update successful");
      // window.location.reload()
      let found_book_id = await book.aggregate([
        {
          $match: {
            "_id": mongoose.Types.ObjectId(req.params.id)
          }
        },
      ])
      console.log(found_book_id[0].chapter)
      res.render('pages/detail.ejs', { data: found_book_id, chapter: found_book_id[0].chapter });
      // res.redirect(req.get('referer'));
    } else
      console.log('Error #3 : ' + JSON.stringify(err, undefined, 2))
  })
})
router.post('/updatechapter/:id/:ep_id', async (req, res) => {
  console.log('book_id ', req.params.id)
  console.log('ep_id ', req.params.ep_id)
  console.log('#EDIT CHAPTERggg')
  let found_ep_id = await book.findByIdAndUpdate({
    "_id": req.params.id,
    "chapter": {
      $elemMatch: {
        _id: req.params.ep_id
      }
    }
  },
    [
      {
        $set: {
          "chapter": {
            $map: {
              input: "$chapter",
              as: "m",
              in: {
                $cond: [
                  { $eq: ["$$m._id", req.params.ep_id] }, // condition
                  { $mergeObjects: ["$$m", { name: req.body.name, image: req.body.image, text: req.body.text, }] }, // true
                  "$$m" // false
                ]
              }
            }
          }
        }
      }
    ])
  console.log(found_ep_id)
  let found_book_id = await book.aggregate([
    {
      $match: {
        "_id": mongoose.Types.ObjectId(req.params.id)
      }
    },
  ])
  console.log(found_book_id[0].chapter)
  res.render('pages/detail.ejs', { data: found_book_id, chapter: found_book_id[0].chapter });
})


router.post('/deletechapter/:id/:ep_id', async (req, res) => {
  // console.log(req.params.name)
  console.log('book_id ', req.params.id)
  console.log('ep_id ', req.params.ep_id)
  console.log("#DELETE CHAPTER")
  let found_ep_id = await book.findByIdAndUpdate(
    { _id: req.params.id },
    { $pull: { 'chapter': { _id: req.params.ep_id } } }
  );
  console.log(found_ep_id)
  let found_book_id = await book.aggregate([
    {
      $match: {
        "_id": mongoose.Types.ObjectId(req.params.id)
      }
    },
  ])
  console.log(found_book_id[0].chapter)
  res.render('pages/detail.ejs', { data: found_book_id, chapter: found_book_id[0].chapter });
})
router.post('/delete/:id', (req, res) => {
  console.log(req.params.id)
  console.log("#DELETE")
  book.findByIdAndRemove(req.params.id, (err, docs) => {
    if (!err) {
      console.log("delete successful");
      // res.send(docs)
      res.redirect('/catagoryBook')
    } else
      console.log('Error #4 : ' + JSON.stringify(err, undefined, 2))
  })
})


// ----------------- App ----------------
router.get('/app', (req, res) => {
  book.find((err, docs) => {
    if (!err) {
      for (let i = 0; i < docs.length; i++) {
        book.findById({ _id: docs[i]._id }, (err, data) => {
          dateExpired = moment.utc(data.create_date).add(7, 'days').isBefore(moment.utc())
          if (dateExpired) {
            book.findByIdAndUpdate(data._id, { status: dateExpired }, { new: true }, (err, docs) => {
              if (!err) {
                // console.log("update true successful");
              } else
                console.log('Error #1.1 : ' + JSON.stringify(err, undefined, 2))
            })
          } else {
            book.findByIdAndUpdate(data._id, { status: dateExpired }, { new: true }, (err, docs) => {
              if (!err) {
                // console.log("update false successful");
              } else
                console.log('Error #1.2 : ' + JSON.stringify(err, undefined, 2))
            })
          }
        })
      }
      res.send(docs)
    } else
      console.log('Error #1.3 : ' + JSON.stringify(err, undefined, 2))
  })
})
//update book
router.post('/updateview/:id', (req, res) => {
  // console.log("book_id: " + req.params.id)
  book.findById(req.params.id, function (error, docs) {
    if (!error) {
      // console.log(docs.view)
      current_view = docs.view
      update_view = current_view + 1
      console.log(update_view)
      book.findByIdAndUpdate(req.params.id, { $set: { view: update_view } }, function (error, update) {
        if (!error) {
          console.log('update view')
          res.send('update view')
        } else {
          console.log('Error #2 : ' + JSON.stringify(error, undefined, 2))
        }
      })
    } else {
      console.log('Error #2 : ' + JSON.stringify(error, undefined, 2))
    }
  })
})

//save book 
router.post('/addFav/:id', (req, res) => {
  console.log("book_id: " + req.params.id)
  console.log("user_id: " + req.body.user_id)
  User.findByIdAndUpdate(req.body.user_id, { $addToSet: { savebook: req.params.id } }, function (error, update) {
    if (!error) {
      console.log('add book')
      res.send('added book')
    } else {
      console.log('Error #2 : ' + JSON.stringify(error, undefined, 2))
    }
  })
})
//remove book
router.post('/removeFav/:id', async function (req, res) {
  User.findByIdAndUpdate(req.body.user_id, { $pull: { savebook: req.params.id } }, function (error, update) {
    if (!error) {
      console.log('remove book')
      res.send('removed book')
    } else {
      console.log('Error #2 : ' + JSON.stringify(err, undefined, 2))
    }
  })
})
//check my book
router.post('/saveBook/:id', async function (req, res) {
  var result = await User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.body.user_id)
      }
    },
  ])
  res.send(result[0].savebook)
})
//ชbookshelf
router.get('/bookshelf/:id', async function (req, res) {
  // console.log("user_id: " + req.params.id)
  var arr = [];
  var result = await User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.params.id)
      }
    },
    {
      $unwind: "$savebook"
    },
    {
      $lookup:
      {
        localField: "savebook",
        from: "books",
        foreignField: "_id",
        as: "savebook"
      }
    },
  ])
  res.status(200).send(result)
  // console.log(result[0].savebook)
  // for (let i = 0; i < result[0].savebook.length ; i++) {
  //   console.log(result[0].savebook.length)
  //   book.find({ _id: result[0].savebook[i] }, async(err, docs) => {
  //     if (!err) {
  //       console.log(docs)
  //       arr.push(docs)
  //       // console.log('+++++++++++')
  //       // res.send([docs, result[0].savebook])
  //       console.log(arr)
  //       return;
  //     } else
  //       console.log('Error #3 : ' + JSON.stringify(err, undefined, 2))
  //   })
  // }
  // console.log(arr)
})

router.get('/app/:name', (req, res) => {
  // console.log(req.params.name)
  if (req.params.name == 'ใหม่ล่าสุด') {
    book.find({ status: false }, (err, docs) => {
      if (!err) {
        // console.log('docs')
        res.send(docs)
      } else
        console.log('Error #3 : ' + JSON.stringify(err, undefined, 2))
    })
  } else {
    book.find({ category: req.params.name }, (err, docs) => {
      if (!err) {
        // console.log('docs')
        res.send(docs)
      } else
        console.log('Error #4 : ' + JSON.stringify(err, undefined, 2))
    })
  }
})

//select book catagory//
router.post("/catagory", async function (req, res) {
  const catagory = req.body.catagory
  let found_book = await book.aggregate([
    {
      $match: {
        category: catagory
      }
    }
  ])
  if (found_book.length == 0) {
    res.status(200).send("Not found")
  } else {
    res.status(200).send(found_book)
  }
})

router.get('/app/detail/:id', (req, res) => {
  // console.log(req.params.id)
  book.find({ _id: req.params.id }, (err, docs) => {
    if (!err) {
      // console.log(docs)
      res.send(docs)
    } else
      console.log('Error #5 : ' + JSON.stringify(err, undefined, 2))
  })
})

module.exports = router;