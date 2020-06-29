const stripe = require('stripe')(process.env.STRIPE_API_SECRET);
const mongoose = require("mongoose")

const DiscordAPI = require("../../../my_modules/discordapi");

const Users = mongoose.model("Users")
const PremiumKeys = mongoose.model("PremiumKeys")

// /api/stripe/subscribe - POST

//The purchase page utilizing Stripe
module.exports = async function(req, res){
    var response = {success: false}

    try {
        const {paymentMethod, billingPeriod} = req.body

        //Must be logged in
        if(!req.session.access_token) throw "Not logged in"

        //Determine what plan to charge for
        var plan
        if(billingPeriod === "monthly") plan=process.env.STRIPE_PREMIUM_MONTHLY_PLAN_ID
        else if(billingPeriod === "yearly") plan=process.env.STRIPE_PREMIUM_YEARLY_PLAN_ID
        else throw "Invalid plan selected"

        //Get their Discord information
        const {id, email, verified} = await DiscordAPI.GetUser(req.session.access_token)

        //Only verified emails can buy a key
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

        //Starts the subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{plan}],
			metadata: {
				user_snowflake: id
			}
        })
        .catch(()=>{throw "Failed to start the subscription..."})

        if(subscription.status === "incomplete") throw "Failed to charge your card..."
        
        //Creates the premium key because their subscription has been activated
        var newKey = new PremiumKeys({
            _id: subscription.id,
            userID: id, 
        })
        await newKey.save()
        .catch(e => {
            console.error(e)
            throw "Critical error: The server failed to save your subscription even though your charge was successful. Please contact support immediately!"
        })
		
		//Updates the user document with an email so it they can receive emails regarding their purchase
		await Users.updateOne({_id: id}, {email: email})

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
}