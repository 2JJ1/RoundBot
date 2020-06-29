const mongoose = require('mongoose')
const xss = require('xss')

const DiscordOAuth2 = require('../../../../my_modules/discordapi')

const AutoResponders = mongoose.model('AutoResponders')

// /guilds/:guildid/autoresponders

module.exports = async function(req, res) {
    var response = {}

    var user = await DiscordOAuth2.GetUser(req.session.access_token)
    var username = user.username && `${user.username}#${user.discriminator}`

    try {
        //EJS already does join(",") on the array when displaying each checker's array
        response.autoResponders = await AutoResponders.findById(req.guild.id) || {checkers: [], responses: []}
    }
    catch(e){
        console.log(e)
        if(typeof e === "string") response.error = e
    }

    res.render('guilds/guild/autoresponders/index', {
        res: response, 
        username, 
        guild: req.guild
    })
}