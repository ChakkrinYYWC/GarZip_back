const   mongoose = require('mongoose'),
        passportLocalMongoose = require('passport-local-mongoose');

let DashboardSchema = new mongoose.Schema({
    newmember_day: Number,
    user_day: Number,
    user_month: Number,
    viewer_catagory: Number
});

DashboardSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('dashboard', DashboardSchema);
