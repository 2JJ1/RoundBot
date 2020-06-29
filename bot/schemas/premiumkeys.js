const mongoose = require("mongoose")

module.exports = mongoose.model("PremiumKeys", {
    _id: String, //Stripe subscription ID
    userID: String, //Discord user ID snowflake (Who bought this key)
    guildID: String, //Discord guild id (What guild this key is assigned to)
    pendingCancel: Boolean,
})