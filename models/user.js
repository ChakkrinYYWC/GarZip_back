const   mongoose = require('mongoose'),
        passportLocalMongoose = require('passport-local-mongoose');

let userSchema = new mongoose.Schema({
    // username : String,
    email : {
        type: String,
        unique: true
    },
    mode : Boolean,
    username : {
        type : String,
        unique : true
    },
    savebook : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "book"
    },
    continue_book : Number,
    permission : String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('user', userSchema);