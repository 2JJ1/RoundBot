const router = require('express').Router()
const DiscordOAuth2 = require('../../my_modules/discordapi')

// /guilds

router.get('/', async (req, res, next) => {
    if(!req.session.access_token) return res.redirect('/')

    var user = await DiscordOAuth2.GetUser(req.session.access_token)
    var username = user.username && `${user.username}#${user.discriminator}`

    //Only FF#0255 and Funtimesgetfunner can view this page
    if(user.id !== "423644128681656320" && user.id !== "526806117993545748") return next()

    var guilds = await DiscordOAuth2.GetGuilds(req.session.access_token)

    res.render('admin/index', {
        guilds,
        username
    })
})

module.exports = router