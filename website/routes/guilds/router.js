const router = require('express').Router()

// /guilds

router.get('/', require('./index'))

router.use('/:guildid', require('./guild/router'))

module.exports = router