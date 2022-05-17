const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const chartSchema = new Schema({
    name: String,
    register: Number,
    play: Number,
});
module.exports = mongoose.model("Chart", chartSchema);