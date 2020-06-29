const router = require("express").Router()
const stripe = require('stripe')(process.env.STRIPE_API_SECRET);
const mongoose = require("mongoose")
const mailgun = require("../../../my_modules/mailgun")

const DiscordAPI = require("../../../my_modules/discordapi");

const Users = mongoose.model("Users")

// /api/stripe/paymentmethod

//Updates the payment method
router.post("/", async (req, res) => {
    var response = {success: false}

    try {
        const {paymentMethod} = req.body

        //Must be logged in
        if(!req.session.access_token) throw "Not logged in"

        //Get their Discord information
        const {id, email, verified} = await DiscordAPI.GetUser(req.session.access_token)

        //Only verified emails can attach a card
        if(!verified) throw "Please verify your email on Discord first!"

        // Find the Stripe customer which represents this user
		const User = await Users.findById(id)
        var customer
        if(User && User.stripeCustomerID){
            try { customer = await stripe.customers.retrieve(User.stripeCustomerID) } 
            catch(e){}
        }
        if(customer && !customer.deleted){
            //Update the payment method on the customer
            //Attach card to the customer
            await stripe.paymentMethods.attach(paymentMethod.id, {customer: customer.id})
            //Make the new card the default card
            await stripe.customers.update(customer.id, {
                invoice_settings: {
                    default_payment_method: paymentMethod.id,
                }
            })
        }
        //If there is no existing Stripe customer representing this user, create one
        else {
            //Create the customer 
            customer = await stripe.customers.create({
                email: email,
                payment_method: paymentMethod.id,
                invoice_settings: {
                    default_payment_method: paymentMethod.id,
                },
                metadata: {
                    user_snowflake: id
                }
            })

            //Update the user with their new stripeCustomerID
            await Users.findByIdAndUpdate(id, {stripeCustomerID: customer.id}, {upsert: true})
        }
		
		//Updates the user document with an email so they can receive emails regarding their subscriptions
        await Users.updateOne({_id: id}, {email: email})
        
        //Sends security email stating their payment method was changed
        await mailgun.SendBasicEmail(email, "Payment Method Changed", `RoundBot: Successfully Updated Your Payment Method\n\nYour payment method has been changed to a card ending in ${paymentMethod.card.last4}. This card will be used to pay for future subscription payments for premium keys.`)

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

//Deletes the payment method
router.delete("/", async (req, res) => {
    var response = {success: false}

    try {
        //Must be logged in
        if(!req.session.access_token) throw "Not logged in"

        //Get their Discord information
        const {id, email} = await DiscordAPI.GetUser(req.session.access_token)

        //Fetch their payment method
		const User = await Users.findById(id) //To get their customer id
        const customer = await stripe.customers.retrieve(User.stripeCustomerID) //The customer to remove the payment method
        const paymentMethod = await stripe.paymentMethods.retrieve(customer.invoice_settings.default_payment_method) //What payment method to remove

        //Remove their paymethod method
        await stripe.paymentMethods.detach(paymentMethod.id)
		
        //Sends security email stating their payment method was removed
        await mailgun.SendBasicEmail(email, "Payment Method Removed", `RoundBot: Successfully Removed Your Payment Method\n\nIf any, subscriptions will expire on the billing due date. If you would like to continue your subscription(s), please re-attach a payment method on the billing page.`)

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