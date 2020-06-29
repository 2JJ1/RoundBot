const mongoose = require('mongoose')

const eightballResponses = require('../../flatdbs/eightball')

//Variables
const Guilds = mongoose.model("Guilds")
const FunCommands = mongoose.model("FunCommands")

module.exports = async function(msg){
    //Check if settings allow this command
    var guildSettings = await Guilds.findById(msg.guild.id)
	if(!guildSettings || guildSettings.funcommands !== true) throw "The fun commands module is disabled"
	var funCommands = await FunCommands.findById(msg.guild.id)
    if(!funCommands || funCommands.eightball !== true) throw "The 'eightball' fun command module is disabled"

    if(msg.content.split(" ").length < 3) throw "Your question is too short."

    var response = eightballResponses[Math.floor(Math.random()*eightballResponses.length)]
    msg.reply(response)
}