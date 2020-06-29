const moment = require("moment")
const { stripIndents } = require("common-tags")
const mongoose = require("mongoose")

var ObjectID = mongoose.Types.ObjectId
const ModCommands = mongoose.model("ModCommands")
const BanLogs = mongoose.model("BanLogs")

module.exports = async function(msg){
    var modCommandSettings = await ModCommands.findById(msg.guild.id) || {}

    var totalBans = (await msg.guild.fetchBans()).size
    
    //Bans from the past 24 hours
    if(modCommandSettings.ratelimitbans){
        var todaysBans = (await BanLogs.find({
            _id: {
                $gt: ObjectID.createFromTime(Date.now() / 1000 - 24*60*60)
            },
            guildId: msg.guild.id
        }, {limit: 25})).length
    }

    var totalMutes = (await msg.guild.members.fetch()).filter(member => member.roles.cache.filter(role => role.name.toLowerCase() === "muted").size > 0).size

    msg.reply({embed: {
        title: `${msg.guild.name}'s Guild Information`,
        thumbnail: {
            url: msg.guild.iconURL()
        },
        fields: [
            {name: "Guild Information", 
            value: stripIndents`
                > ID: ${msg.guild.id}
                > Owner: ${(await msg.guild.members.fetch(msg.guild.ownerID)).user.tag}
                > Owner ID: ${msg.guild.ownerID}
                > Members #: ${(await msg.guild.members.fetch()).size}
                > Roles #: ${msg.guild.roles.cache.size}
                > Created: ${moment.utc(msg.guild.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss") + ' (UTC)'}
                > Region: ${msg.guild.region}
                > Bans: ${totalBans}
                > Mutes: ${totalMutes}` +
                (modCommandSettings.ratelimitbans ? `\n> Rate Limited Bans: ${todaysBans}/25` : "")
            },
        ],
    }})
}