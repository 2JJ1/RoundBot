const mongoose = require('mongoose')

//Sub-module toggles for the Moderator Commands module
module.exports = mongoose.model("Mutes", {
    guildId: String,
    userId: String,
    expires: Number,
})