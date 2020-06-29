const router = require("express").Router()
const pm2 = require('pm2')
const DiscordOAuth2 = require('../../my_modules/discordapi')

// /api/admin

router.post("/restartbot", async (req, res) => {
    var response = {success: false}

    try{
        var user = await DiscordOAuth2.GetUser(req.session.access_token)

        //Only FF#0255 and Funtimesgetfunner can request to this page
        if(user.id !== "423644128681656320" && user.id !== "526806117993545748") throw "Invalid permission"

        //Restart PM2 bot
        await new Promise((resolve, reject) => {
            pm2.connect(function(err) {
                if (err) reject(err)
                pm2.restart("bot", err => {
                    if(err) reject(err)
                    resolve()
                })
            })
        })
        .catch((err)=>{ 
            console.error(new Error(err))
            throw "The server failed to restart the bot..." 
        })

        response.success = true
    }
    catch(e){
        if(typeof e === "string") response.reason = e
        else {
            console.log(e)
            response.reason = "Server error"
        }
    }

    pm2.disconnect()

    res.json(response)
})

module.exports = router