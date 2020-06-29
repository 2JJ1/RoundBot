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

        var checkers = req.body.checkers
        if(!checkers) throw "Missing checkers"
        if(checkers.constructor !== Array) throw "Bad request"
        if(checkers.length < 2) throw "Too few checkers"
        if(checkers.length > 10) throw "Exceeded the limit of 10 checkers"
        for(var i=0; i<checkers.length; i++) {
            if(checkers[i].length > 350) throw "A checker has exceeded the maximum of 350 characters"
            if(checkers[i].length < 3) throw "Each checker must have a minimum of 3 characters"
            //Convert to an array using this delimeter
            checkers[i] = checkers[i].split(',')
        }

        var _response = req.body.response
        if(!_response) throw "Missing response"
        if(typeof _response !== "string") throw "Bad request"
        if(response.length > 2048) throw "Response exceeded Discord's limit of 2,048 characters."

        //Hacky sanitization to assume false if undefined for some reason
        var dmPreferred = req.body.dmPreferred === true ? true : false

        //Get the guild's auto-responders
        var doc = await AutoResponders.findById(guildId).lean()
        if(doc){
            if(doc.checkers.length === index){
                //Adds new auto-responder. 
                //  The logic is basically length + 1, so the requests means add a new one
                doc.checkers.push(checkers)
                doc.responses.push(_response)
                doc.dmPreferreds.push(dmPreferred)
            }
            else if(doc.checkers[index] !== undefined){
                //Updates existing auto-responder
                doc.checkers[index] = checkers
                doc.responses[index] = _response
                doc.dmPreferreds[index] = dmPreferred
            }
            else throw "This auto-responder does not exist"

            await AutoResponders.updateOne({_id: guildId}, {
                checkers: doc.checkers,
                responses: doc.responses,
                dmPreferreds: doc.dmPreferreds
            })
        }
        else {
            //The guild does not have an AutoResponders document, so create and add first auto-responder
            await new AutoResponders({
                _id: guildId,
                checkers: [checkers],
                responses: [_response],
                dmPreferreds: [dmPreferred]
            }).save()
        }

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