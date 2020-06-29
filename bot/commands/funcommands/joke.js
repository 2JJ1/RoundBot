const mongoose = require('mongoose')
const { Set } = require("../../my_modules/discord-set");

//Variables
const Guilds = mongoose.model("Guilds")
const FunCommands = mongoose.model("FunCommands")
const set = new Set();

module.exports = async function(msg){
    //Check if settings allow this command
    var guildSettings = await Guilds.findById(msg.guild.id)
	if(!guildSettings || guildSettings.funcommands !== true) throw "The fun commands module is disabled"
	var funCommands = await FunCommands.findById(msg.guild.id)
    if(!funCommands || funCommands.joke !== true) throw "The 'joke' fun command module is disabled"

    let res = set.joke({type: "general"});
    let _msg = await msg.channel.send(`${res.setup}`)
    setTimeout(function(){
        _msg.edit(`${res.setup}\n${res.punchline}`)
    }, 3000)
}