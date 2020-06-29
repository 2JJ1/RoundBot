const client = require('../my_modules/DiscordJsBotClient')

module.exports = async function(msg){
    var numGuilds = client.guilds.cache.size
    var numUsers = client.users.cache.size
    var numChannels = client.channels.cache.size

    msg.reply({embed: {
        description: "I'm RoundBot, the all in one Discord bot. I am used for auto-moderation, a middle-man for moderation, and fun/utility commands. Type !help for help.",
        fields: [
            {name: "Serving:", value: `${numGuilds} servers | ${numUsers} users | ${numChannels} channels`}
        ],
        footer: {
            text: "https://roundbot.net/ : [WIP]Features are very slowly being worked on."
        }
    }})
}