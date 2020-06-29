const DiscordOAuth2 = require('./discordapi')
const mongoose = require("mongoose")

const Guilds = mongoose.model("Guilds")

//This express.js middleware for client routes
//Enforces the rule that only only admins can manage the server
//Enforces the rule that only servers with the bot can be managed
//Also applies some data to req.guild to get basic data on the guild
module.exports = async function(req, res, next){
    //Must be logged in
    if(!req.session.access_token) return res.redirect('/')

    req.guild = {}

    //Guildid should be specified
    var guildid = req.params.guildid
    if(!guildid) return res.redirect('/guilds')
    req.guild.id = guildid

    //Check if user is in the guild
    var partialGuild = await DiscordOAuth2.GetGuilds(req.session.access_token)
    partialGuild = partialGuild.filter(guild => guild.id === guildid)[0]

    //Discord user
    var user = await DiscordOAuth2.GetUser(req.session.access_token)
    req.guild.user = user

    //User not in guild, so redirect to guilds list
    if(!partialGuild) return res.redirect('/guilds')

    //Get the guild from Discord.js
    var guild = DiscordOAuth2.GuildDetails(guildid)
    //Check if bot is not in the guild
    if(!guild) return res.redirect('/guilds')
    req.guild.guild = guild

    //Fetch their RoundBot settings for this guild
    var guildSettings = await Guilds.findById(guildid) || {}
    req.guild.settings = guildSettings

    //Check if user is an admin
    var isAdmin = (
        partialGuild.owner || 
        partialGuild.permissions === 0x7FFFFFFF || 
        //Check if they have the admin role
        guild && guildSettings.adminRoleEditSettings && (await guild.members.fetch(user.id)).roles.cache.find(role => role.name.toLowerCase() === "admin")?true:false
    )
    //Restrict non-guild-admins from managing the bot
    if(!isAdmin) return res.redirect('/guilds')
    req.guild.isAdmin = isAdmin

    //Check if there is a server outage
    if(guild && !guild.available) return res.send("Guild unavailable: Server outage")

    //metadata
    req.guild.icon = partialGuild.icon ? `https://cdn.discordapp.com/icons/${partialGuild.id}/${partialGuild.icon}.png` : "https://groovy.bot/img/assets/unknown.svg"
    req.guild.name = partialGuild.name

    next()
}