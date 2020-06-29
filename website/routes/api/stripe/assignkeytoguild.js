const mongoose = require("mongoose")

const DiscordAPI = require("../../../my_modules/discordapi");

const PremiumKeys = mongoose.model("PremiumKeys")
const Guilds = mongoose.model("Guilds")

// POST /api/stripe/assignkeytoguild

module.exports = async function(req, res){
    var response = {success: false}

    try {
        //Must be logged in
        if(!req.session.access_token) throw "Not logged in"

        if(!req.body.key) throw "Missing key"
        if(!req.body.guildId) throw "Missing guild"

        //Get their Discord information
        const {id} = await DiscordAPI.GetUser(req.session.access_token)

        const premiumKey = await PremiumKeys.findById(req.body.key)
        if(premiumKey.userID != id) throw "This key does not belong to you"

        await PremiumKeys.updateOne({_id: req.body.key}, {guildID: req.body.guildId})
        await Guilds.updateOne({_id: req.body.guildId}, {premiumKey: req.body.key})
        
        response.success = true
    }
    catch(e){
        if(typeof e === "string") response.error = e
        else {
            response.error = "Server error"
            console.error(e)
        }
    }

    res.json(response)
}