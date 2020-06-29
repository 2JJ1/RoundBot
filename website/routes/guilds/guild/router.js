const router = require('express').Router({ mergeParams: true });

const inguild = require('../../../my_modules/inguildclient')

// /guilds/:guildid

router.get('/', require('./index'))
router.get('/welcomemessage', inguild, require('./welcomemessage'))
router.use('/autoresponders', inguild, require('./autoresponders/router'))
router.get('/admincommands', inguild, require('./admincommands'))
router.get('/modcommands', inguild, require('./modcommands'))
router.get('/funcommands', inguild, require('./funcommands'))

module.exports = router