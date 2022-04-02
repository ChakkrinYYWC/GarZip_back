const passport = require('passport'),
  express = require('express'),
  book = require('../models/book');
moment = require("moment");

var router = express.Router();

router.get('/', (req, res) => {
  book.find((err, docs) => {
    if (!err) {
      // res.send(docs)
      res.render('pages/book.ejs', { 'books': docs })
    } else
      console.log('Error #1 : ' + JSON.stringify(err, undefined, 2))
  })
})


router.post('/', async (req, res) => {
  // console.log(req.body)
  // console.log('category :: '+req.body.category)
  var newRecord = new book({
    book_id: req.body.book_id,
    name: req.body.name,
    auther: req.body.auther,
    trailer: req.body.trailer,
    text: req.body.text,
    image: req.body.image,
    category: req.body.category,
    view : 0,
  })
  console.log(newRecord)
  newRecord.save((err, docs) => {
    if (!err) {
      console.log("save successful");
      // res.send(docs)
      res.redirect('/book')
    } else
      console.log('Error #2 : ' + JSON.stringify(err, undefined, 2))
  })
})

router.put('/:id', (req, res) => {

  var updatedRecord = {
    book_id: req.body.book_id,
    name: req.body.name,
    auther: req.body.auther,
    trailer: req.body.trailer,
    text: req.body.text,
    category: req.body.category,
    // view: req.body.view
  }
  console.log(updatedRecord)
  book.findByIdAndUpdate(req.params.id, { $set: updatedRecord }, { new: true }, (err, docs) => {
    if (!err) {
      console.log("update successful");
      res.send(docs)
    } else
      console.log('Error #3 : ' + JSON.stringify(err, undefined, 2))
  })
})

router.delete('/:id', (req, res) => {
  book.findByIdAndRemove(req.params.id, (err, docs) => {
    if (!err) {
      console.log("delete successful");
      // res.send(docs)
      res.redirect('/book')
    } else
      console.log('Error #4 : ' + JSON.stringify(err, undefined, 2))
  })
})



// ----------------- App ----------------
router.get('/app', (req, res) => {
  // console.log('##')
  book.find((err, docs) => {
    if (!err) {
      // console.log(docs)
      res.send(docs)
    } else
      console.log('Error #1 : ' + JSON.stringify(err, undefined, 2))
  })
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
  if(found_book.length == 0){
      res.status(200).send("Not found")
  }else{
      res.status(200).send(found_book)
  }
})


module.exports = router;