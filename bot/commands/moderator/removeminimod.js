const mongoose = require('mongoose')

const permissions = require('../../wrappers/permissions')

const Guilds = mongoose.model("Guilds")
const ModCommands = mongoose.model("ModCommands")

module.exports = async function(msg){
	//Check if settings allow this command
	var guildSettings = await Guilds.findById(msg.guild.id)
	if(!guildSettings || guildSettings.modcommands !== true) throw "The moderator commands module is disabled"
	var modCommands = await ModCommands.findById(msg.guild.id)
	if(!modCommands || modCommands.removeminimod !== true) throw "The removeminimod command module is disabled"

	//Author must be an moderator
    if(!(await permissions.IsModerator(msg.member))) throw "You are not a moderator"
	
	//There must be a mention
	var firstMention = msg.mentions.users.first()
	if(!firstMention) throw 'You must mention someone'
	let target = (await msg.guild.members.fetch()).get(firstMention.id)
	if(!target) throw 'Could not find user...'
	
	//Can't remove mini-mod from someone whos not a mini mod
	if(!(await permissions.IsMiniModerator(target))) throw "That member is not a mini-moderator"

	//Find the role
	var role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "mini-moderator")
	if(!role) throw "Could not find a role named 'mini-moderator' in this guild. This means the user is already not a mini-moderator"
	//Removes the role from the target
	await target.roles.remove(role)
	msg.channel.send(`<@${target.id}> is no longer a mini-moderator`);
}