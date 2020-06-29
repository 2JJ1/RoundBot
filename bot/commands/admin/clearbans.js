const mongoose = require('mongoose')

const permissions = require('../../wrappers/permissions')

const Guilds = mongoose.model("Guilds")
const AdminCommands = mongoose.model("AdminCommands")

module.exports = async function(msg){
    //Check if settings allow this command
    var guildSettings = await Guilds.findById(msg.guild.id)
	if(!guildSettings || guildSettings.admincommands !== true) throw "The admin commands module is disabled"
	var adminCommands = await AdminCommands.findById(msg.guild.id)
	if(!adminCommands || adminCommands.clearbans !== true) throw "The clearbans command module is disabled"

    //The author must be an admin
    if(!(await permissions.IsAdmin(msg.member))) throw "You must be an admin to use this"

    //Fetch guild members with mute role
    var members = await msg.guild.fetchBans()
    
    //Go through each guild member with the mute role and remove their role
    if(members.size > 0){
        msg.channel.send(`Removing ${members.size} ban${members.size > 0 ? "s" : ""}`);
        members = members.array()
        for(var i=0; i<members.length; i++){
            await msg.guild.members.unban(members[i].user.id)
            .catch((err) => {
                msg.channel.send(`Failed to unban <@${members[i].user.id}>`)
                console.log(err)
            })
        };
    } 
    else msg.channel.send(`Seems like no one is banned`);
}