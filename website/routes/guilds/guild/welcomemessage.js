const mongoose = require('mongoose')
const xss = require('xss')

const DiscordOAuth2 = require('../../../my_modules/discordapi')

const WelcomeMessages = mongoose.model('WelcomeMessages')

// /guilds/:guildid/welcomemessage

module.exports = async function(req, res) {
    var response = {}

    var user = await DiscordOAuth2.GetUser(req.session.access_token)
    var username = user.username && `${user.username}#${user.discriminator}`

    try {
        //Restrict non-guild-admins from managing the bot
        if(!req.guild.isAdmin) throw "Not an admin"
        
        var welcomeMessage = await WelcomeMessages.findById(req.guild.id) || {}
        welcomeMessage = welcomeMessage.text
        response.welcomemessage = xss(welcomeMessage)
    }
    catch(e){
        if(typeof e === "string") response.error = e
    }

    res.render('guilds/guild/welcomemessage', {
        res: response, 
        username, 
        guild: req.guild
    })
}