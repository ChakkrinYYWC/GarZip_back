const   mongoose = require('mongoose'),
        passportLocalMongoose = require('passport-local-mongoose');

let BookSchema = new mongoose.Schema({
    book_id : String,
    name : String,
    auther : String,
    trailer : String,
    text : String,
    category : String,
    view : Number,
    image: String,
    create_date : { type: Date, default: Date.now },
});

BookSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('book', BookSchema);

