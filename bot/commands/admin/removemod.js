const mongoose = require('mongoose')

const permissions = require('../../wrappers/permissions')

const Guilds = mongoose.model("Guilds")
const AdminCommands = mongoose.model("AdminCommands")

module.exports = async function(msg){
	//Check if settings allow this command
	var guildSettings = await Guilds.findById(msg.guild.id)
	if(!guildSettings || guildSettings.admincommands !== true) throw "The admin commands module is disabled"
	var adminCommands = await AdminCommands.findById(msg.guild.id)
	if(!adminCommands || adminCommands.removemod !== true) throw "The removemod command module is disabled"

	//Author be an admin
    if(!(await permissions.IsAdmin(msg.member))) throw "You are not an admin"
	
	//There must be a mention
	var firstMention = msg.mentions.members.first()
	if(firstMention === undefined) throw "You must mention someone"

	var role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "moderator")
	if(!role) throw "Could not find a role named 'moderator' in this guild. This means the user is already not a moderator"
	var roleId = role.id
					
	firstMention.roles.remove(roleId)
	.then(function(){
		msg.channel.send(`<@${firstMention.id}> is no longer a moderator`);
	})
}