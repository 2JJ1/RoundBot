const mongoose = require('mongoose')

const Guilds = mongoose.model('Guilds')

// /api/togglemodule

//Toggles the specified moduile in guild setting
module.exports = async function(req, res) {
    var response = {success: false}

    try{
        var guildId = req.body.guildId
        if(!guildId) throw "Missing guild"

        var _module = req.body.module
        if(typeof _module !== "string") throw "Invalid module"

        var toggle = req.body.toggle
        if(typeof toggle !== "boolean") throw "Invalid toggle"

        /*No need to worry about invalid modules being passed since the 
        mongoose Guilds model has built in sanitization
        This doesnt tell if the module is invalid though... 
        :C Idk how to check if its not defined in the schema*/

        var guildSettings = await Guilds.findById(guildId) || {}
        if(!guildSettings.premiumKey && toggle==true){
            if(_module === "autoresponder") throw "Only premium guilds can use the auto-responder module"
            else if(_module === "chatbot") throw "Only premium guilds can use the chatbot module"
            else if(_module === "antispam") throw "Only premium guilds can use the antispam module"
            else if(_module === "logMessages") throw "Only premium guilds can use the Message Logs module"
        }

        await Guilds.updateOne({_id: guildId}, {
            _id: guildId,
            [_module]: toggle
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
}