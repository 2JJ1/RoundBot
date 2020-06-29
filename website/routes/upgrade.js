const mongoose = require("mongoose")
const DiscordAPI = require('../my_modules/discordapi')

const PremiumKeys = mongoose.model("PremiumKeys")

module.exports = async function(req, res){
    var user = await DiscordAPI.GetUser(req.session.access_token)
    var username = user.username && `${user.username}#${user.discriminator}`

    
    var unusedKey = await (await PremiumKeys.find({userID: user.id})).find(key => !key.guildID)

    res.render('upgrade.ejs', {username, stripePublicKey: process.env.STRIPE_API_PUBLIC, unusedKey})
}