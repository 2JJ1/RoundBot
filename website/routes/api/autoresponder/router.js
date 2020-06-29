const router = require("express").Router()

// /api/autoresponder

router.post("/", require('./post'))
router.delete("/", require('./delete'))

module.exports = router