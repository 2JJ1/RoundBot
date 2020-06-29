const mongoose = require('mongoose')

module.exports = mongoose.model('WelcomeMessages', {
    _id: String, //Guild ID
    text: {
        type: String,
        required: true
    }
})