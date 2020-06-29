const mongoose = require('mongoose')

const DiscordOAuth2 = require('../../../../my_modules/discordapi')

const AutoResponders = mongoose.model('AutoResponders')

// /guilds/:guildid/autoresponders/:responderindex

module.exports = async function(req, res) {
    var response = {}

    var user = await DiscordOAuth2.GetUser(req.session.access_token)
    var username = user.username && `${user.username}#${user.discriminator}`

    try {
        var index = parseInt(req.params.responderindex)

        var autoResponders = await AutoResponders.findById(req.guild.id) || {checkers: [], responses: [], dmPreferreds: []}

        if(autoResponders.checkers.length === index){
            //This was a request to create a new auto responder
            //This will be handled in the API. I just made the if statement for logic readability.
        }
        else if(autoResponders.checkers[index] === undefined){
            //Bad request: Auto responder does not exist
            return res.status(404).redirect(`/guilds/${req.guild.id}/autoresponders`)
        }

        //EJS already does join(",") on the array when displaying each checker's array
        response.autoResponder = {
            checkers: autoResponders.checkers[index] || [],
            response: autoResponders.responses[index],
            dmPreferred: autoResponders.dmPreferreds[index]
        }
    }
    catch(e){
        if(typeof e === "string") response.error = e
    }

    res.render('guilds/guild/autoresponders/autoresponder', {
        res: response, 
        username, 
        guild: req.guild,
        responderIndex: req.params.responderindex
    })
}