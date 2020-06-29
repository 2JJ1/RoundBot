const DiscordAPI = require('../my_modules/discordapi')

module.exports = async function(req, res){
    if(req.session.access_token){
        await DiscordAPI.RevokeToken(req.session.access_token) //Asks Discord to delete the token
        .catch(e => console.error) //Continue even if it errors
        req.session.destroy() //Deletes the session
    }

    res.redirect('/')
}