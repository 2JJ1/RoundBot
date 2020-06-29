const AutoResponders = require("mongoose").model("AutoResponders")

// /api/autoresponder - post request
// Adds or updates an auto-responder
module.exports = async function(req, res){
    var response = {success: false}

    try{
        var guildId = req.body.guildId
        if(!guildId) throw "Missing guild"

        var index = req.body.index
        if(index === undefined) throw "Missing index"
        if(typeof index !== "number") throw "Bad request"

        //Get the guild's auto-responders
        var doc = await AutoResponders.findById(guildId).lean()
        if(!doc) throw "This guild has no auto-responders"
        else if(doc.checkers[index] === undefined) throw "This checker does not exist"

        doc.checkers.splice(index, 1)
        doc.responses.splice(index, 1)
        doc.dmPreferreds.splice(index, 1)

        await AutoResponders.updateOne({_id: guildId}, {
            checkers: doc.checkers,
            responses: doc.responses,
            dmPreferreds: doc.dmPreferreds
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

    res.json(response)
}