const router = require('express').Router()
const mongoose = require('mongoose')

const WelcomeMessages = mongoose.model('WelcomeMessages')

// /api/welcomemessage

router.put('/', async (req, res) => {
    var response = {success: false}

    try{
        var guildId = req.body.guildId
        if(!guildId) throw "Missing guild"
        if(typeof guildId !== "string") throw "Invalid guild id"

        var text = req.body.text
        if(!text) throw "Missing text"
        if(typeof text !== "string") throw "Invalid text"

        await WelcomeMessages.findOneAndUpdate({_id: guildId}, {
            _id: guildId,
            text: text
        }, {upsert: true})

        response.success = true
    }
    catch(e){
        if(typeof e === "string") response.reason = e
        else {
            response.reason = "Server error"
            console.log(e)
        }
    }

    res.json(response)
})

module.exports = router