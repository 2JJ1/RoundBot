const mongoose = require('mongoose')

module.exports = mongoose.model("AdminCommands", {
    _id: String, //Guild ID
    addmod: Boolean,
    removemod: Boolean,
    clearmutes: Boolean,
    clearwarns: Boolean,
    clearbans: Boolean,
})