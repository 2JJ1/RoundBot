const router = require('express').Router()
var bodyParser = require('body-parser')
const inGuild = require('../../../my_modules/inguildapi') //Ensures that only admins of the guild can make the API call

// /api/stripe

router.use("/webhook", require('./webhook'))
router.post("/subscribe", bodyParser.json(), require('./subscribe'))
router.use("/paymentmethod", bodyParser.json(), require('./paymentmethod'))
router.use("/subscription", bodyParser.json(), require('./subscription'))
router.post("/assignkeytoguild", bodyParser.json(), inGuild, require('./assignkeytoguild'))

module.exports = router