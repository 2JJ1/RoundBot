const mongoose = require("mongoose")

const permissions = require('../../wrappers/permissions')

const Guilds = mongoose.model("Guilds")
const ModCommands = mongoose.model("ModCommands")

module.exports = async function(msg){
	//Check if settings allow this command
    var guildSettings = await Guilds.findById(msg.guild.id)
	if(!guildSettings || guildSettings.modcommands !== true) throw "The moderator commands module is disabled"
	var modCommands = await ModCommands.findById(msg.guild.id)
	if(!modCommands || modCommands.kick !== true) throw "The kick command module is disabled"

	//Only mods can kick
    let isMod = await permissions.IsModerator(msg.member)
	if(isMod !== true)  throw {safe: 'You are not a moderator'};

	//Who to kick
	var target = msg.mentions.members.first()
	if(!target) throw "You must mention someone"

	//Cant kick moderators
	if(await permissions.IsModerator(target)) throw "Moderators can't be kicked"

	//Why they were kicked
	var reason
	//If specified through an option
	if(msg.opts.reason) reason = msg.opts.reason
	//Otherwise, assume anything after the mention is the reason unless any other option is specified
	else if(Object.keys(msg.opts).length <= 0){
		let match = msg.content.match(/<@!?(\d{17,19})>/)
		if(match) reason = msg.content.substr(match.index + match[0].length + 1)
	}
	reason = (reason.length > 2000 ? reason.substr(0,2000) + "..." : reason) || "Not specified"


	//DM member saying they've been kicked
	//Can't send this after because of Discord limits
	if(target) await target.send(`You've been kicked from the guild named, "${msg.guild.name}". Reason: ${reason}`).catch(()=>{})

	//Kicks the user
	await target.kick(`Kicked by <@${msg.author.id}> - Reason: ${reason}`)

	//Confirm completion
	msg.react("✅")
}