const mongoose = require("mongoose")
var ObjectID = mongoose.Types.ObjectId

const DiscordOAuth2 = require('../../../my_modules/discordapi')

const Guilds = mongoose.model("Guilds")
const BanLogs = mongoose.model("BanLogs")
const Mutes = mongoose.model("Mutes")

// /guilds/:guildid

module.exports = async function(req, res) {
    var response = {}

    var user = await DiscordOAuth2.GetUser(req.session.access_token)
    var username = user.username && `${user.username}#${user.discriminator}`

    try {
        if(!req.session.access_token) return res.redirect('/')

        var guildid = req.params.guildid
        if(!guildid) return res.redirect('/guilds')

        //Check if user is in the guild
        var partialGuild = await DiscordOAuth2.GetGuilds(req.session.access_token)
        partialGuild = partialGuild.filter(guild => guild.id === guildid)[0]

        //User not in guild, so redirect to guilds list
        if(!partialGuild) return res.redirect('/guilds')

        var guild = DiscordOAuth2.GuildDetails(guildid)

        response.settings = await Guilds.findById(guildid) || {}

        //Check if user is an admin
        var isAdmin = (
            //If they own the guild
            partialGuild.owner || 
            //If they have the administrator permission
            partialGuild.permissions === 0x7FFFFFFF || 
            //If they have the admin role
            guild && response.settings.adminRoleEditSettings && (await guild.members.fetch(user.id)).roles.cache.find(role => role.name.toLowerCase() === "admin")?true:false
        )

        response.guildicon = partialGuild.icon ? `https://cdn.discordapp.com/icons/${partialGuild.id}/${partialGuild.icon}.png` : "https://groovy.bot/img/assets/unknown.svg"

        response.guildname = partialGuild.name

        //Check if there is a server outage
        if(guild && !guild.available) throw "Guild unavailable"

        //Check if bot is not in the guild
        if(!guild){    
            // Bot is not in the guild

            //Not owner or no admin permission, so its impossible for them to invite the bot
            if(!isAdmin) throw "Can not invite"
            
            //Offer to invite bot
            if(!guild) return res.redirect('/invite')
        }
        
        //Bans from the past 24 hours
        response.todaysBans = (await BanLogs.find({
			_id: {
				$gt: ObjectID.createFromTime(Date.now() / 1000 - 24*60*60)
			},
			guildId: guildid
        }, {limit: 25})).length

        response.cachedMutes = await Mutes.countDocuments({guildId: guildid})

        var guildClass = DiscordOAuth2.client.guilds.cache.get(guildid)

        response.totalMutes = (await guildClass.members.fetch()).filter(member => member.roles.cache.filter(role => role.name.toLowerCase() === "muted").size > 0).size

        response.totalBans = (await guildClass.fetchBans()).size

        //Restrict non-guild-admins from managing the bot
        if(!isAdmin) throw "Not an admin"
    }
    catch(e){
        if(typeof e === "string") response.error = e
        else console.error(e)
    }

    res.render('guilds/guild/index', {res: response, username, guildid})
}