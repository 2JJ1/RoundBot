const mongoose = require("mongoose")

const permissions = require('../../wrappers/permissions')

const Guilds = mongoose.model("Guilds")
const ModCommands = mongoose.model("ModCommands")

module.exports = async function(msg){
	var guildSettings = await Guilds.findById(msg.guild.id)
	if(!guildSettings || guildSettings.modcommands !== true) throw "The moderator commands module is disabled"
	var modCommands = await ModCommands.findById(msg.guild.id)
	if(!modCommands || modCommands.unwarn !== true) throw "The unwarn command module is disabled"

	//Only admins, moderators, and mini-moderators can use this command
	let isMod = await permissions.IsModerator(msg.member)
	let isMiniMod = await permissions.IsMiniModerator(msg.member)
	if(!isMod && !isMiniMod) throw "You can't execute that command"

	//Determine who to unwarn
	let target = msg.mentions.members.first()
	if(!target) throw 'You must mention someone in the guild'
	let targetid = target.id;

	//Fetch the warned role
	var warnRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "warned")
	if(!warnRole) throw "The warned 'role' does not exist in this guild. This means the member already unwarned."
			
	//Removes the role
	await target.roles.remove(warnRole)
	
	msg.channel.send("Removed warned role from <@" + targetid + ">");
}