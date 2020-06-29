// Create all schemas at once so we can just use mongoose.model("ModelName")
// We can optionally import models individually

require('./guilds')
require('./welcomemessages')
require('./admincommands')
require('./modcommands')
require('./funcommands')
require('./autoresponder')
require('./mutes')
require('./banlogs')
require('./users')
require('./premiumkeys')