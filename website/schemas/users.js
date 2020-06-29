const mongoose = require("mongoose")

/*Users should only be created when their information is necessary. Like when a user purchases a premium key, 
we will need to store information relating to their purchase*/

module.exports = mongoose.model("Users", {
    _id: String, //Disord user snowflake id
    stripeCustomerID: String,
	email: String,
	verified: Boolean, //If there email is verified on Discord
})