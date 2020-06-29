const router = require("express").Router()
const stripe = require('stripe')(process.env.STRIPE_API_SECRET);

const DiscordAPI = require("../../../my_modules/discordapi");

// /api/stripe/subscription

router.patch("/", async (req, res) => {
    var response = {success: false}

    try {
        //Must be logged in
        if(!req.session.access_token) throw "Not logged in"

        var cancel_at_period_end = req.body.subscribed !== true

        //Get their Discord information
        const {id} = await DiscordAPI.GetUser(req.session.access_token)

        var subscription = await stripe.subscriptions.retrieve(req.body.id)
        if(subscription.metadata.user_snowflake == id){
            stripe.subscriptions.update(req.body.id, {
                cancel_at_period_end
            })
        }
		
        response.success = true
    }
    catch(e){
        if(typeof e === "string") response.reason = e
        else {
            response.reason = "Server error"
            console.error(e)
        }
    }

    res.json(response)
})

module.exports = router