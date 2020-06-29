const mongoose = require('mongoose')

const DiscordOAuth2 = require('../../../my_modules/discordapi')

const AdminCommands = mongoose.model('AdminCommands')

// /guilds/:guildid/commands

module.exports = async function(req, res) {
    var response = {}

    var user = await DiscordOAuth2.GetUser(req.session.access_token)
    var username = user.username && `${user.username}#${user.discriminator}`

    try {
        response.settings = await AdminCommands.findById(req.guild.id) || {}

        //Restrict non-guild-admins from managing the bot
        if(!isAdmin) throw "Not an admin"
    }
    catch(e){
        if(typeof e === "string") response.error = e
    }

    res.render('guilds/guild/admincommands', {
        res: response, 
        username, 
        guild: req.guild
    })
}