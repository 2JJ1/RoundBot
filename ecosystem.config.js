module.exports = {apps: [
	{
		name: "roundbot-website",
		script: "./website/index.js",
		watch: true,
		ignore_watch: [
			"static\\assets\\css"
		],
		autorestart: false,
		cwd: "./website"
	},
	{
		name: "roundbot-bot",
		script: "./bot/index.js",
		watch: true,
		autorestart: false,
		cwd: "./bot"
	}
]}