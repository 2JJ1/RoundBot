const DiscordOAuth2 = require('./discordapi')
const mongoose = require("mongoose")

const Guilds = mongoose.model("Guilds")

//This express.js middleware for /api routes will check if the user & bot is in the guild and if the user is an admin
module.exports = async function(req, res, next){
    req.guild = {}

    if(!req.session.access_token) return req.guild.error = "Not logged in"

    var guildid = req.body.guildId

    //Check if user is in the guild
    var partialGuild = await DiscordOAuth2.GetGuilds(req.session.access_token)
    if(partialGuild === "Rate limited") return res.status(429).json({error: "Rate limited"})
    partialGuild = partialGuild.filter(guild => guild.id === guildid)[0]
    req.guild.partialGuild = partialGuild

    //Discord user
    var user = await DiscordOAuth2.GetUser(req.session.access_token)
    req.guild.user = user

    //The user must be in the guild
    if(!partialGuild) return res.json({error: "Not in guild"})

    //Check if bot is not in the guild
    var guild = DiscordOAuth2.GuildDetails(guildid) 
    if(!guild) return res.json({error: "Bot not in server"})
    req.guild.guild = guild

    //Fetch their RoundBot settings for this guild
    var guildSettings = await Guilds.findById(guildid) || {}
    req.guild.settings = guildSettings

    //Restrict non-guild-admins from managing the bot
    var isAdmin = (
        partialGuild.owner || 
        partialGuild.permissions === 0x7FFFFFFF || 
        //Check if they have the admin role
        guild && guildSettings.adminRoleEditSettings && (await guild.members.fetch(user.id)).roles.cache.find(role => role.name.toLowerCase() === "admin")?true:false
    )
    if(!isAdmin) return res.json({error: "Not an admin"})
    req.guild.isAdmin = isAdmin

    req.guild.icon = partialGuild.icon ? `https://cdn.discordapp.com/icons/${partialGuild.id}/${partialGuild.icon}.png` : "https://groovy.bot/img/assets/unknown.svg"
    req.guild.name = partialGuild.name

    next()
}