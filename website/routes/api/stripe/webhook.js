const router = require("express").Router()
var bodyParser = require('body-parser')
const stripe = require('stripe')(process.env.STRIPE_API_SECRET);
const mongoose = require("mongoose")
const mailgun = require("../../../my_modules/mailgun")

const Users = mongoose.model("Users")
const Guilds = mongoose.model("Guilds")
const PremiumKeys = mongoose.model("PremiumKeys")

// /api/stripe/webhook

//Signature verification requires that the body is row
router.use(bodyParser.raw({type: 'application/json'}))

//Listens for events from Stripe like when a subscription's payment has succeeded
router.post("/", async (req, res) => {
    let event;
	const sig = req.headers['stripe-signature'];

	try {
		event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
	} 
	catch (err) {
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}

	//console.log(event.type)

	// Handle the event. Note that although some notifs are sent chronologically, earlier requests may finish later than a followed notif
	switch (event.type) {
		//User has an upcoming payment coming soon
		case "invoice.upcoming": {
			//Send email reminding them of an upcoming payment
			let customer = await stripe.customers.retrieve(event.data.object.customer)
			let User = await Users.findById(customer.metadata.user_snowflake)
			await mailgun.SendBasicEmail(User.email, "Upcoming Invoice", "RoundBot: Upcoming Invoice\n\nYou subscribed to a premium key on RoundBot. This is a courtesy email to remind you that your recurring payment will be automatically charged in a few days.")
			break
		}
		//Payment successfully received by Stripe
		case 'invoice.payment_succeeded': {
			//Send thank you email
			//Send email reminding them of an upcoming payment
			let customer = await stripe.customers.retrieve(event.data.object.customer)
			let User = await Users.findById(customer.metadata.user_snowflake)
			await mailgun.SendBasicEmail(User.email, "Successful Payment", "RoundBot: Successful Payment\n\nThank you. Your payment has successfully been received for the premium key subscription as offered by RoundBot.")
			break
		}
		//The customer was deleted
		case "customer.deleted": {
			await Users.updateOne({_id: event.data.object.metadata.user_snowflake}, {stripeCustomerID: undefined})
			break
		}
		//Their subscription ended/expired
		case "customer.subscription.deleted": {
			// Remove their benefits
			//Delete the key
			var deletedKey = await PremiumKeys.findByIdAndDelete(event.data.object.id)
			//Remove premium from a guild that used this key
			if(deletedKey.guildID) await Guilds.updateOne({_id: deletedKey.guildID}, {$unset: {premiumKey: ""}})
			//Send sorry to see you go email
			//Checks the subscription for the snowflake in case this was triggered from a customer deletion
			let subscription = await stripe.subscriptions.retrieve(event.data.object.id)
			let User = await Users.findById(subscription.metadata.user_snowflake)
			await mailgun.SendBasicEmail(User.email, "Premium Key Subscription Expired", "RoundBot: Premium Key Subscription Expired\n\nWe're sorry to see you go. Your Premium Key subscription with RoundBot has expired, so you have lost a key. If any guild was using this key, the guild has lost access to the premium features.")
			break
		}
		//Subscription updated. Most likely canceled or uncanceled their subscription
		case "customer.subscription.updated": {
			//Update database to reflect current subscription state
			await PremiumKeys.updateOne({_id: event.data.object.id}, {pendingCancel: event.data.object.cancel_at_period_end})
			break
		}
		case "charge.refunded": {
			//Send email notifying them of an incoming refund
			let customer = await stripe.customers.retrieve(event.data.object.customer)
			//Can't email them because their user_snowflake is missing
			if(customer.deleted) break
			let User = await Users.findById(customer.metadata.user_snowflake)
			await mailgun.SendBasicEmail(User.email, "Refund On The Way", "RoundBot: A refund Is On The Way\n\nA refund has been issued by RoundBot. Please note that this could take 5-10 days to post.")
			break
		}
		default:
			// Unexpected event type
			console.error(`Stripe webhook received unhandled event type: ${event.type}`)
			return res.status(400).end();
  	}

	// Return a response to acknowledge receipt of the event
	res.json({received: true});
})

module.exports = router