const mongoose = require("mongoose")
var ObjectID = require('mongodb').ObjectID

const permissions = require('../../wrappers/permissions')

const Guilds = mongoose.model("Guilds")
const ModCommands = mongoose.model("ModCommands")
const BanLogs = mongoose.model("BanLogs")

module.exports = async function(msg){
	//Check if settings allow this command
    var guildSettings = await Guilds.findById(msg.guild.id)
	if(!guildSettings || guildSettings.modcommands !== true) throw "The moderator commands module is disabled"
	var modCommands = await ModCommands.findById(msg.guild.id)
	if(!modCommands || modCommands.ban !== true) throw "The ban command module is disabled"

	//Must be a mod to continue
    let isMod = await permissions.IsModerator(msg.member)
	if(isMod !== true)  throw {safe: 'You are not a moderator'};

	//Grab target to ban
	var targetid;
	//First check if a mention is valid
	if(msg.mentions.users.first() !== undefined) {
		targetid = msg.mentions.users.first().id;
	}
	else{
		//Mention not found. The member isn't in the guild, so pattern check and grab the id that way
		let arr = msg.content.split(" ")
		let pattern = /<@!?(\d{17,19})>/
		for(let i=0; i<arr.length; i++){
			var match = arr[i].match(pattern)
			if(match != null){
				targetid = match[1]
				break;
			}
		}
	}

	//Check if targetid is undefined
	if(!targetid) throw {safe: "User not found"}

	//Grabs guild member from member id/snowflake
	var member = (await msg.guild.members.fetch()).get(targetid);
	if(member){ //Must be a guild member to check for roles
		let targetIsMod = await permissions.IsModerator(member)
		if(targetIsMod)
			throw {safe: 'Can\'t ban a moderator!'};
	}

	//Check if the user is banned
    var bannedMember = (await msg.guild.fetchBans()).get(targetid)
    if(bannedMember) throw "That user is already banned"

	//Limit global ban count to 25 per 24 hours if rate-limiting is enabled
	//Premium only
	if(guildSettings.premiumKey && modCommands.ratelimitbans === true){
		await BanLogs.find({
			_id: {
				$gt: ObjectID.createFromTime(Date.now() / 1000 - 24*60*60)
			},
			guildId: msg.guild.id
		}, {limit: 25})
		.then(docs => {
			if(docs.length >= 25) throw "This guild has already reached the limit of 25 bans per 24 hours"
		})
	}

	//Why they were banned
	var reason
	//If specified through an option
	if(msg.opts.reason) reason = msg.opts.reason
	//Otherwise, assume anything after the mention is the reason unless any other option is specified
	else if(Object.keys(msg.opts).length <= 0){
		let match = msg.content.match(/<@!?(\d{17,19})>/)
		if(match) reason = msg.content.substr(match.index + match[0].length + 1)
	}
	reason = (reason.length > 2000 ? reason.substr(0,2000) + "..." : reason) || "Not specified"

	//DM member saying they've been banned
	//Can't send this after because of Discord limits
	if(member) await member.send(`You've been banned from the guild named, "${msg.guild.name}". Reason: ${reason}`).catch(err=>{})

	//Bans the user
	await msg.guild.members.ban(targetid, {days: 5, reason: `Banned by <@${msg.author.id}>. Reason: ${reason}`})
	.then(async user => {
		//Confirm completion
		msg.react("✅")

		//Log it if rate-limiting is enabled
		if(modCommands.ratelimitbans === true){				
			const newLogDoc = new BanLogs({
				guildId: msg.guild.id
			})
			await newLogDoc.save()
		}
	})
}