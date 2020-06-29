const mongoose = require('mongoose')

module.exports = mongoose.model("FunCommands", {
    _id: String, //Guild ID
    meme: Boolean,
    eightball: Boolean,
    joke: Boolean,
    roast: Boolean,
    compile: Boolean,
})