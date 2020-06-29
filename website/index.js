require('dotenv').config({ path: '../.env' })
const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const sassMiddleware = require('node-sass-middleware')
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const helmet = require("helmet")
const pm2StressMonitor = require("./my_modules/pm2stressmonitor")

const DiscordOAuth = require("./my_modules/discordapi")

const app = express()

app.use(helmet())

app.set('trust proxy', 1) //trust first proxy
app.set('view engine', 'ejs')
app.set('views', './views')

//Support sass/scss
app.use(sassMiddleware({
	src: path.join(__dirname, 'sass'),
	dest: path.join(__dirname, 'static',),
	outputStyle: 'compressed',
}));

app.use(express.static(path.join(__dirname, 'static')));

//Connect to Mongo database
mongoose.connect('mongodb://localhost/roundbot', {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
});

//Load all Mongoose models
require('./schemas')

//Load account session handler
app.use(session({
	secret: "r0undb0t1!1!ahahar2",
	store: new MongoStore({
		mongooseConnection: mongoose.connection,
		autoRemove: 'native' // Default
	}),
	name: "RBSec",
	saveUninitialized: false, //Deletes session with empty session data
	rolling: true, //Makes expiration data reset
	resave: true, //So the new expiration date saves to the server too
	cookie: { 
		path: '/',
		httpOnly: true, 
		secure: process.env.NODE_ENV === 'production',
		domain: process.env.COOKIE_DOMAIN,  
		maxAge: 1000*60*60*24*14 // 1 second -> 1 minute -> 1 hour -> 1 day -> 14 days
	}
}))

//Handle routes
app.use(require('./routes/router'))

//Express.js exception handling
app.use(function(err, req, res, next) {
    if(err.name === "URIError"){
		res.send("Bad request: Invalid URI");
	}
	else{
		console.error("Express.js error:", err)
		res.status(500).send("The server has errored... This will be fixed when the admins have noticed");
	}
})

//Start listening for requests
port = process.env.PORT || 8081
app.listen(port, ()=>{
	pm2StressMonitor()

	console.log(`RoundBot product website listening on port ${port}.`)
})

//Login with bot
DiscordOAuth.client.login(process.env.BOT_TOKEN);