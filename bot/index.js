require('dotenv').config({ path: '../.env' })
const client = require('./my_modules/DiscordJsBotClient')
var latinize = require('latinize');
const mongoose = require('mongoose')
const antiIPLogger = require("anti-ip-logger")
const throttler = require('./my_modules/throttler')

//Load all Mongoose models
require('./schemas')

const CheckTimedMutes = require('./my_modules/checktimedmutes');
const commands = require('./commands/handler')
const TextHasWords = require('./my_modules/texthaswords')
const CleanRespond = require('./my_modules/cleanrespond')
const AIChatResponse = require('./my_modules/aichatresponse')
const AntiSpam = require('./my_modules/antispam')
const isInvite = require('./my_modules/isinvite')
require('./wrappers/permissions')

//Connect to Mongo database
mongoose.connect('mongodb://localhost/roundbot', {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const Guilds = mongoose.model("Guilds")
const WelcomeMessages = mongoose.model("WelcomeMessages")
const AutoResponders = mongoose.model("AutoResponders")
const Mutes = mongoose.model("Mutes")

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag} and serving ${client.guilds.cache.size} guild(s)`);

	client.user.setActivity("roundbot.net | !help", {type: "PLAYING"})
	
	CheckTimedMutes(client)
	//Check every 30 minutes
	setInterval(()=>{CheckTimedMutes(client)}, 1000 * 60 * 30)
});

//Called when someone joins the server
client.on("guildMemberAdd", async (member) => {
	var guildSettings = await Guilds.findById(member.guild.id) || {}

	/* Temp removed until I implement this into the website
	//Ban if their name has a banned phrase
	var bannedStrings = ["wearedev", "wrd", "selfbot", "roundbot"]
	for(var i=0; i<bannedStrings.length; i++){
		if(latinize(member.displayName.toLowerCase()).indexOf(bannedStrings[i]) !== -1){
			await member.user.send("Your name contains a banned word, thus you have been banned. Sorry for the inconvenience! We just have measures in place to prevent imposters from sending viruses via direct messages.")
			.catch(error => {})

			member.ban({reason: "Detected imposter", days: 1})

			break;
		}
	}
	*/

	//Check the database if this member is muted in this guild
	if(guildSettings.mutebypass){
		let doc = await Mutes.findOne({guildId: member.guild.id, userId: member.user.id})
		if(doc){
			//Fetch the "muted" role
			var mutedRole = member.guild.roles.cache.find(role => role.name.toLowerCase() === "muted")
			//Applies the role if it exists
			mutedRole && member.roles.add(mutedRole.id)
			//Tell them
			member.user.send(`You were muted in ${member.guild.name} before you left the guild, so the mute role has been re-applied`)
			.catch(error => {})
		}
	}

	//Sends the welcome message if specified
	if(guildSettings.welcomemessage){
		var doc = (await WelcomeMessages.findById(member.guild.id))
		var welcomeMessage = doc && doc.text
		if(!guildSettings.premiumKey) welcomeMessage += "\nCheck out RoundBot! https://roundbot.net/"
		welcomeMessage && member.user.send(welcomeMessage).catch(error => {})
	}
});

client.on('message', async msg => {
	//Don't handle messages from bots
	if(msg.author.bot) return
	//Only handle messages in guild text channels
	if(msg.channel.type !== "text") return

	var guildSettings = await Guilds.findById(msg.guild.id) || {}

	//Throttle message handling per guild to prevent the bot from going unresponsive due to stress
	//Averge 40 or 25 messages per second, but in a 15 second window
	const throttleOptions = {
		maxCalls: guildSettings.premiumKey ? 40*15 : 25*15,
		timeFrame: 15,
	}
	var _throttler = await throttler(msg.guild.id, throttleOptions)
	//Activates #TextChannel slow mode
	if(_throttler.exceedCount >= 1 && msg.channel.rateLimitPerUser < 5){
		msg.channel.setRateLimitPerUser(5, "RoundBot throttling due to stress. Slow mode activated to prevent excessive throttling, otherwise moderator command's latency render commands useless. Upgrade to premium for an increased rate limit.")
		.catch(() => {
			msg.channel.send("This server's message send rate is stressed me out. Upgrade to premium for an increased rate limit. I lack permissions to turn on slow mode for this text channel, so I'm leaving.").catch(()=>{})
			msg.guild.leave()
		})
	} 

	try{
		//Anti-spam/raid handling (Premium)
		if(guildSettings.premiumKey && guildSettings.antispam) AntiSpam(msg)

		//Deletes Discord server invite links (If enabled)
		if(guildSettings.antiinvite && isInvite(msg.content)) return msg.delete({reason: "Discord server invite link found."})

		//Deletes IP loggers (If enabled)
		if(guildSettings.antiIPLog && await antiIPLogger(msg.content)) return msg.delete({reason: "IP logger domain found."})

		//Command parsing is initiated with ! at the beginning of the chat
		if (msg.content.substring(0,1) === "!") await commands.HandleCommand(msg, guildSettings)
		//Trigger the chatbot if the message starts off with the bot being mentioned (If enabled) (Premium)
		else if(guildSettings.premiumKey && guildSettings.chatbot && msg.content.indexOf(`<@!${client.user.id}>`) === 0){
			msg.channel.startTyping()
			let response = await AIChatResponse(msg.content)
			msg.channel.stopTyping()
			msg.reply(response)
		}
		//Check for defined key words and auto respond (If enabled) (Premium)
		else if(guildSettings.premiumKey && guildSettings.autoresponder){
			var responders = await AutoResponders.findById(msg.guild.id)
			/*Even though its turned on, they might not have actually created 
			any checkers, so check */
			if(responders) {
				for(var i=0; i<responders.checkers.length; i++){ //Goes through each checker
					if(TextHasWords(msg.content, responders.checkers[i])){
						var text = responders.responses[i]
						responders.dmPreferreds[i] ? CleanRespond(msg, text) : msg.reply(text)
					}
				}
			}
		}
	} catch(e){
		if(typeof e === "object" && 'safe' in e) msg.reply(e.safe);
		else if (typeof e === "string") msg.reply(e)
		else console.error(e) // Possibly a server error...
	}
});

//Emitted when a message is deleted
client.on("messageDelete", async msg => {
	//Don't handle messages from bots
	if (msg.author.bot) return
	//Only handle messages in text channels
	if(msg.channel.type !== "text") return

	var guildSettings = await Guilds.findById(msg.guild.id) || {}

	//Only premium guilds get message audit logs & Log only if this guild wants it
	if(!guildSettings.premiumKey || !guildSettings.logMessages) return

	//Find the logs channel
	var logChannel = msg.guild.channels.cache.find(channel => channel.name.toLowerCase() === "logs")
	//Create it if it doesn't exist
	if(!logChannel){
		logChannel = await msg.guild.channels.create("logs", {
			type: "text",
			nsfw: true,
			reason: "The message log setting was enabled. RoundBot attempted to log something, but the channel did not exist."
		})
	}
	//Exit if the bot could not find or create the logs channel(E.g lacks permission)
	if(!logChannel) return

	//Logs the deleted message
	logChannel.send({embed: {
		author: {
			name: `Message From ${msg.author.tag} Deleted`,
			icon_url: msg.author.avatarURL() || "https://discordapp.com/assets/322c936a8c8be1b803cd94861bdfa868.png",
		},
		fields: [
			{
				name: "Message",
				value: msg.content.substr(0,500) + (msg.content.length > 500 ? "..." : "")
			},
			{
				name: "Channel",
				value: `<#${msg.channel.id}>`
			}
		]
	}})
})

//Emitted when a message is updated
client.on("messageUpdate", async (oldMsg, newMsg) => {
	//Don't handle messages from bots
	if (oldMsg.author.bot) return
	//Only handle messages in text channels
	if(oldMsg.channel.type !== "text") return

	var guildSettings = await Guilds.findById(oldMsg.guild.id) || {}

	//Only premium guilds get message audit logs & Log only if this guild wants it
	if(!guildSettings.premiumKey || !guildSettings.logMessages) return

	//Don't log if the edited message is the same (Idk how it happens, but it does)
	if(oldMsg.content === newMsg.content) return

	//Find the logs channel
	var logChannel = oldMsg.guild.channels.cache.find(channel => channel.name.toLowerCase() === "logs")
	//Create it if it doesn't exist
	if(!logChannel){
		logChannel = await oldMsg.guild.channels.create("logs", {
			type: "text",
			nsfw: true,
			reason: "The message log setting was enabled. RoundBot attempted to log something, but the channel did not exist."
		})
	}
	//Exit if the bot could not find or create the logs channel(E.g lacks permission)
	if(!logChannel) return

	//Logs the deleted message
	logChannel.send({embed: {
		author: {
			name: `${oldMsg.author.tag} Edited A Message`,
			icon_url: oldMsg.author.avatarURL() || "https://discordapp.com/assets/322c936a8c8be1b803cd94861bdfa868.png",
		},
		fields: [
			{
				name: "Old Message",
				value: oldMsg.content.substr(0,500) + (oldMsg.content.length > 500 ? "..." : "")
			},
			{
				name: "New Message",
				value: newMsg.content.substr(0,500) + (newMsg.content.length > 500 ? "..." : ""),
				inline: true
			},
			{
				name: "Message Link & Channel",
				value: `[${oldMsg.channel.name}](${oldMsg.url})`,
			}
		]
	}})
})

client.on("error", e => {
	//Discord probably went down
	//Retries logging in after a minute
	setTimeout(function(){
		client.destroy()
		client.login(process.env.BOT_TOKEN);
	}, 1000 * 60)
})

client.login(process.env.BOT_TOKEN);