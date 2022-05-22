const   mongoose = require('mongoose'),
        passportLocalMongoose = require('passport-local-mongoose');

let BookSchema = new mongoose.Schema({
    book_id : {
        type: String,
        unique: true
    },
    name : String,
    auther : String,
    trailer : String,
    text : String,
    category : String,
    view : Number,
    image: String,
    create_date : { type: Date, default: Date.now },
    pitch: Number,
    status: Boolean,
    chapter: {
        name: String,
        image: String,
        text: String
    }
});

BookSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('book', BookSchema);

