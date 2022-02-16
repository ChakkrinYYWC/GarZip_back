const   mongoose = require('mongoose'),
        passportLocalMongoose = require('passport-local-mongoose');

let BookSchema = new mongoose.Schema({
    id : String,
    name : String,
    auther : String,
    trailer : String,
    text : String,
    category : String,
    view : Number,
    create_date : { type: Date, default: Date.now },
});

BookSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('book', BookSchema);

