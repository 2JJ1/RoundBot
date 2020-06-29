const mongoose = require("mongoose")

const Mutes = mongoose.model("Mutes")

//Check database to clear expired mutes
module.exports = function(client){
    //Find all expired mutes
    Mutes.find({
        expires: {$lt: Date.now()}
    })
    .then(async docs => {
        for(var i=0; i<docs.length; i++){
            var doc = docs[i]
            var guild = client.guilds.cache.get(doc.guildId)
            let target = (await guild.members.fetch()).get(doc.userId)

            //Don't attempt to remove the role if they're not in the server.
            //The role would be gone anyways
            if(target){
                var mutedRoleId = guild.roles.cache.find(role => role.name.toLowerCase() === "muted").id
                await target.roles.remove(mutedRoleId)
            }

            //Remove the log from the database
            await Mutes.deleteOne({_id: doc._id})
        }
    })
}