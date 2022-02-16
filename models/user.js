const   mongoose = require('mongoose'),
        passportLocalMongoose = require('passport-local-mongoose');

let userSchema = new mongoose.Schema({
    // username : String,
    email : String,
    mode : Boolean,
    name : String,
    savebook : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Books"
    },
    continue_book : Number
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('user', userSchema);