var mailgun = require("mailgun-js")({apiKey: process.env.MAILGUN_APIKEY, domain: 'm1.roundbot.net'});

//Promise based Mailgun wrapper

class Mailgun {
	//Wraps mail sender into promise
	SendMail(emaildata) {
		//Sends
		return new Promise( ( resolve, reject ) => {
			mailgun.messages().send(emaildata, function (error, body) {
				if (error) 
					reject(error);
				
				resolve();
			});
		})
	}

	//Just the bare minimum to sending an email
	SendBasicEmail(to, subject, body) {
		let emaildata = {
			from: '"noreply" <noreply@roundbot.net>',
			to: to,
			subject: subject,
			text: body
		};

		return this.SendMail(emaildata)
	}
}

module.exports = new Mailgun();