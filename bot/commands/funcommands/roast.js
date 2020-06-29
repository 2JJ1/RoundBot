const mongoose = require('mongoose')

const roasts = require('../../flatdbs/roasts')

//Variables
const Guilds = mongoose.model("Guilds")
const FunCommands = mongoose.model("FunCommands")

module.exports = async function(msg){
    //Check if settings allow this command
    var guildSettings = await Guilds.findById(msg.guild.id)
	if(!guildSettings || guildSettings.funcommands !== true) throw "The fun commands module is disabled"
	var funCommands = await FunCommands.findById(msg.guild.id)
    if(!funCommands || funCommands.roast !== true) throw "The 'roast' fun command module is disabled"

    //Fetch random roast and send it
    var roast = roasts[Math.floor(Math.random() * roasts.length)]
    msg.channel.send(roast)
}