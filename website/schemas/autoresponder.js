const mongoose = require('mongoose')

mongoose.model("AutoResponders", {
    _id: String, //Guild ID
    //Example: [["jjsploit", ["broken", "patched"]]]
    checkers: Array,
    //Responses index corresponds to the checkers index
    responses: Array,
    //true: Send response to DMs if DMs are open
    //false: Reply in the text channel only
    //index corresponds to the checkers index
    dmPreferreds: Array
})