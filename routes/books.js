const   passport = require('passport'),
        express = require('express'),
        book = require('../models/book');

var router = express.Router();

router.get('/', (req, res) => {
  book.find((err, docs) => {
    if (!err){
      res.send(docs)
    //   res.render('pages/index.ejs')
    }else
      console.log('Error #1 : ' + JSON.stringify(err, undefined, 2))
  })
})

router.post('/', async (req, res) => {
  console.log(req.body)
  var newRecord = new book({
      id: "w1",
      name: "w2",
      auther: "w3",
      trailer: "ww4",
      text: "w5",
      category: "w6",
      view: 77
  })
  console.log(newRecord)
  newRecord.save((err, docs) => {
    if (!err){
      console.log("save successful");
      res.send(docs)
    }else
      console.log('Error #2 : ' + JSON.stringify(err, undefined, 2))
  })
})

router.put('/:id', (req, res) => {
    // if (!ObjectID.isValid(req.params.id))
    //     return res.status(400).send('No record with given id : ' + req.params.id)
    
    var updatedRecord = {
        name: "q2",
        auther: "q3",
        trailer: "qq4",
        text: "q5",
        category: "q6",
        view: 00
    }
    console.log(updatedRecord)
    book.findByIdAndUpdate(req.params.id, { $set: updatedRecord }, { new: true }, (err, docs) => {
        if (!err){
            console.log("update successful");
            res.send(docs)
        }else
            console.log('Error #3 : ' + JSON.stringify(err, undefined, 2))
    })
})

router.delete('/:id', (req, res) => {
    // if (!ObjectID.isValid(req.params.id))
    //     return res.status(400).send('No #4 : ' + req.params.id)

    book.findByIdAndRemove(req.params.id, (err, docs) => {
        if (!err){
            console.log("delete successful");
            res.send(docs)
        }else
            console.log('Error #4 : ' + JSON.stringify(err, undefined, 2))
    })
})


module.exports = router;