const router = require('express').Router()

const DiscordAPI = require('../my_modules/discordapi')

router.use('/api', require('./api/router'))

router.use('/admin', require('./admin/router'))

router.get('/', async (req, res) => {
    var user = await DiscordAPI.GetUser(req.session.access_token)
    var username = user.username && `${user.username}#${user.discriminator}`

    res.render('home.ejs', {username})
})

router.get('/upgrade', require("./upgrade"))
router.get('/billing', require("./billing"))

router.get('/commands', async (req, res) => {
    var user = await DiscordAPI.GetUser(req.session.access_token)
    var username = user.username && `${user.username}#${user.discriminator}`

    res.render('commands.ejs', {username})
})

router.get('/login', (req, res) => {
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&redirect_uri=${encodeURIComponent(`${process.env.DOMAIN}/callback`)}&response_type=code&scope=email%20guilds%20identify`)
})

router.get('/logout', require('./logout'))

router.get('/invite', (req, res)=>{
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&redirect_uri=${encodeURIComponent(`${process.env.DOMAIN}/callback`)}&response_type=code&scope=bot%20email%20guilds%20identify`)
})

router.use('/callback', require('./callback'))

router.use('/guilds', require('./guilds/router'))

module.exports = router