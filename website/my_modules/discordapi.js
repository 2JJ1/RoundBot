const Discord = require('discord.js');
const DiscordOauth2 = require("discord-oauth2");
var Base64 = require('js-base64').Base64;

/**
 * Reference to the discord-oauth2 NPM package
 */
exports.oauth = new DiscordOauth2();

/**
 * Reference to the Discord.js client class
 */
exports.client = new Discord.Client();

/* IMPORTANT NOTE: This is not yet programmed to work with refresh_token. 
Requests will currently break after the token expires */

/**
 * @param {string} access_token - The access_token received when OAuth2 authenticated with Discord
 */
exports.GetGuilds = async function(access_token){
    var guilds = await exports.oauth.getUserGuilds(access_token)
    .catch(e => {return {}}) //Returns empty if the request is unauthorized

    if(guilds.message === "You are being rate limited.") throw "Rate limited"

    return guilds
}

/**
 * Returns {id, email, verified}
 * @param {string} access_token - The access_token received when OAuth2 authenticated with Discord
 */
exports.GetUser = async function(access_token){
    var user = exports.oauth.getUser(access_token)
    .catch(e => {return {}}) //Returns empty if the request is unauthorized

    if(user.message === "You are being rate limited.") throw "Rate limited"

    return user
}

/**
 * Returns guild object : https://discordapp.com/developers/docs/resources/guild#guild-object
 * Bot must be in the guild
 * @param {string} guildid - The guild id(snowflake)
 */
exports.GuildDetails = function(guildid){
    var guild = exports.client.guilds.cache.get(guildid)

    return guild
}

/**
 * Requests an access_token and refresh_token
 * https://discordapp.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-response
 * @param {string} access_token - The access_token received when OAuth2 authenticated with Discord
 */
exports.RequestToken = function(code, redirectUri, scope){
    return exports.oauth.tokenRequest({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        grantType: "authorization_code",
        code,
        redirectUri,
        scope,
    })
}

/**
 * Tells Discord that the access_token is no longer needed. Basically log out.
 * @param {string} access_token - The access_token received when OAuth2 authenticated with Discord
 */
exports.RevokeToken = function(access_token){
    // You must encode your client ID along with your client secret string including the colon in between
    const credentials = Base64.encode(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`);
    return exports.oauth.revokeToken(access_token, credentials)
}