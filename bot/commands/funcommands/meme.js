const mongoose = require('mongoose')
const { Set } = require("../../my_modules/discord-set");
const throttler = require("../../my_modules/throttler")

//Variables
const Guilds = mongoose.model("Guilds")
const FunCommands = mongoose.model("FunCommands")
const set = new Set();

module.exports = async function(msg){
    //Check if settings allow this command
    var guildSettings = await Guilds.findById(msg.guild.id)
	if(!guildSettings || guildSettings.funcommands !== true) throw "The fun commands module is disabled"
	var funCommands = await FunCommands.findById(msg.guild.id)
    if(!funCommands || funCommands.meme !== true) throw "The 'meme' fun command module is disabled"

	//Only 5(10 for premium) memes can be called per 5 seconds
	const throttleOptions = {
		maxCalls: guildSettings.premiumKey ? 12 : 5,
        timeFrame: 5,
        burst: false
	}
    await throttler(`${msg.guild.id}-memes`, throttleOptions)
    .catch(()=>{throw "This guild is requesting memes too fast..."})

    set.meme(msg.channel, ["me_irl", "Dankmemes"], { readyMade: true })
}