const mongoose = require('mongoose')

//This is just used to track when a ban is made in a guild for the purpose of rate limiting
module.exports = mongoose.model("BanLogs", {
    guildId: String
})