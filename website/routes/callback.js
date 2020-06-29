const router = require('express').Router()
const mongoose = require("mongoose")
const DiscordAPI = require("../my_modules/discordapi");

const Users = mongoose.model("Users")

// /callback

router.get('/', async (req, res) => {
    if(req.query.error === 'access_denied') return res.redirect('/')

    var code = req.query.code

    var tokenResponse = await DiscordAPI.RequestToken(code, `${process.env.DOMAIN}/callback`, "email identify guilds")

    if(!tokenResponse.access_token) return res.send("Failed to authenticate...")

    if(
        tokenResponse.scope.indexOf("email")===-1 ||
        tokenResponse.scope.indexOf("identify")===-1 ||
        tokenResponse.scope.indexOf("guilds")===-1
    ) return res.status(400).send("Improper request: Missing important information...")

    req.session.access_token = tokenResponse.access_token
    req.session.refresh_token = tokenResponse.refresh_token
	
	//Save their Discord information (e.g useful in Stripe webhook since their access_token would be unknown)
    const {id, email, verified} = await DiscordAPI.GetUser(req.session.access_token)
	await Users.findByIdAndUpdate(id, {email, verified}, {upsert: true})

    res.redirect('/')
})

module.exports = router