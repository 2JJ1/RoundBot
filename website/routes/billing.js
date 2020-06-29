const mongoose = require("mongoose")
const stripe = require('stripe')(process.env.STRIPE_API_SECRET);
const DiscordAPI = require('../my_modules/discordapi')

const Users = mongoose.model("Users")
const PremiumKeys = mongoose.model("PremiumKeys")

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

module.exports = async function(req, res){
    var user = await DiscordAPI.GetUser(req.session.access_token)
    var username = user.username && `${user.username}#${user.discriminator}`

    const cachedUser = await Users.findById(user.id)
    if(!cachedUser.stripeCustomerID) return res.redirect("/upgrade")
    const customer = await stripe.customers.retrieve(cachedUser.stripeCustomerID)
    var paymentMethod 
    if(customer.invoice_settings.default_payment_method) paymentMethod = await stripe.paymentMethods.retrieve(customer.invoice_settings.default_payment_method)
    
    //Gets keys from the database
    var keys = await PremiumKeys.find({userID: user.id})

    //Gets subscription information from Stripe
    for(var i=0; i<keys.length; i++){
        let key = keys[i]

        var subscription = await stripe.subscriptions.retrieve(key._id)
        const expires = new Date(subscription.current_period_end*1000)
        key.expires = `${months[expires.getMonth()]} ${expires.getDate()}, ${expires.getFullYear()}`

        key.cancel_at_period_end = subscription.cancel_at_period_end
    }

    var availableGuilds = []
    var guilds = await DiscordAPI.GetGuilds(req.session.access_token)
    //Normalize logo
    for(var i=0; i<guilds.length; i++){
        guilds[i].icon = guilds[i].icon ? `https://cdn.discordapp.com/icons/${guilds[i].id}/${guilds[i].icon}.png` : "https://groovy.bot/img/assets/unknown.svg"
    
        let keyOccupied = keys.find(key => key.guildID == guilds[i].id)
        if(keyOccupied) keyOccupied.guild = guilds[i]
        else availableGuilds.push(guilds[i])
    }

    res.render('billing.ejs', {username, stripePublicKey: process.env.STRIPE_API_PUBLIC, paymentMethod, keys, availableGuilds})
}