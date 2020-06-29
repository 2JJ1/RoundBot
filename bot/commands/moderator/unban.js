const mongoose = require('mongoose')

const permissions = require('../../wrappers/permissions')

const Guilds = mongoose.model("Guilds")
const ModCommands = mongoose.model("ModCommands")

module.exports = async function(msg){
    //Check if settings allow this command
    var guildSettings = await Guilds.findById(msg.guild.id)
	if(!guildSettings || guildSettings.modcommands !== true) throw "The moderator commands module is disabled"
	var modCommands = await ModCommands.findById(msg.guild.id)
    if(!modCommands || modCommands.unban !== true) throw "The unban command module is disabled"
    
    //Must be a mod to continue
    let isMod = await permissions.IsModerator(msg.member)
	if(isMod !== true)  throw {safe: 'You are not a moderator'};

	//Grab target to unban
    var targetid;
    
    //The member isn't in the guild, so pattern check and grab the id that way
    let arr = msg.content.split(" ")
    let pattern = /<@!?(\d{17,19})>/
    for(let i=0; i<arr.length; i++){
        var match = arr[i].match(pattern)
        if(match != null){
            targetid = match[1]
            break;
        }
    }

    //A mention is required
	if(!targetid) throw "Please make sure the mention is formatted as '<@theirsnowflakeid>'"

    //Check if the user is banned
    var bannedMember = (await msg.guild.fetchBans()).get(targetid)
    if(!bannedMember) throw "That user is not banned"
    
    //The actual unban part
    await msg.guild.members.unban(targetid, `Unanned by <@${msg.author.id}>`)
    msg.channel.send(`<@${targetid}> has been unbanned.`)
}