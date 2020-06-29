const mongoose = require('mongoose')

//Contains minor settings and top level module toggles
//Although some toggles like welcomemessage are here, their full settings are in their own collection
module.exports = mongoose.model('Guilds', {
    _id: String, //Guild ID
    commandPrefix: {
        type: String,
        default: "!"
    },
    premiumKey: String, // _id of premiumkeys collection document
    moderatorRoleName: {
        type: String,
        default: "Moderator"
    },
    mutebypass: Boolean,
    welcomemessage: Boolean,
    antispam: Boolean,
    autoresponder: Boolean,
    admincommands: Boolean,
    modcommands: Boolean,
    funcommands: Boolean,
    chatbot: Boolean,
    antiinvite: Boolean,
    logMessages: Boolean,
    adminRoleEditSettings: Boolean,
    antiIPLog: Boolean,
})