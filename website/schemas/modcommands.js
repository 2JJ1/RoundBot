const mongoose = require('mongoose')

//Sub-module toggles for the Moderator Commands module
module.exports = mongoose.model("ModCommands", {
    _id: String, //Guild ID
    ban: Boolean,
    unban: Boolean,
    kick: Boolean,
    ratelimitbans: Boolean,
    mute: Boolean,
    unmute: Boolean,
    warn: Boolean,
    unwarn: Boolean,
    purge: Boolean,
    addminimod: Boolean,
    removeminimod: Boolean,
})