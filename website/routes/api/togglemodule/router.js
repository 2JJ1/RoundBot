const router = require('express').Router()

const inGuild = require('../../../my_modules/inguildapi')

// /api/togglemodule

router.put('/', require('./index'))
router.put('/admincommands', require('./admincommands'))
router.put('/modcommands', require('./modcommands'))
router.put('/funcommands', require('./funcommands'))

module.exports = router