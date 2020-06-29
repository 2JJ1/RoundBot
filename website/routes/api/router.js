const router = require('express').Router()
var bodyParser = require('body-parser')

//Ensures that only admins of the guild can make the API call
const inGuild = require('../../my_modules/inguildapi')

// /api

router.use('/togglemodule', bodyParser.json(), inGuild, require('./togglemodule/router'))
router.use('/welcomemessage', bodyParser.json(), inGuild, require('./welcomemessage'))
router.use('/autoresponder', bodyParser.json(), inGuild, require('./autoresponder/router'))

router.use('/admin', require('./admin'))

router.use('/stripe', require('./stripe'))

module.exports = router