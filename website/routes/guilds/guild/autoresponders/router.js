const router = require('express').Router({ mergeParams: true });

// /autoresponders

router.get('/', require('./index'))

router.get('/:responderindex', require('./autoresponder'))

module.exports = router