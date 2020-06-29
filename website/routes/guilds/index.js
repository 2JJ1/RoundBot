const router = require('express').Router()
const DiscordOAuth2 = require('../../my_modules/discordapi')

// /guilds

router.get('/', async (req, res) => {
    if(!req.session.access_token) return res.redirect('/')

    var user = await DiscordOAuth2.GetUser(req.session.access_token)
    var username = user.username && `${user.username}#${user.discriminator}`

    var guilds = await DiscordOAuth2.GetGuilds(req.session.access_token)

    //Normalize logo
    for(var i=0; i<guilds.length; i++){
        guilds[i].icon = guilds[i].icon ? `https://cdn.discordapp.com/icons/${guilds[i].id}/${guilds[i].icon}.png` : "https://groovy.bot/img/assets/unknown.svg"
    }

    res.render('guilds/index', {
        guilds,
        username
    })
})

module.exports = router