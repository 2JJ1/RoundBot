Open sourced Discord Bot. I used to use this as a product bot, but my path has led elsewhere. The website features an account system, a UI to manage the bot settings per server, paid subscription system for premium servers. The bot has a bunch of stuff too, but you can learn about that through the website's command page.

# Setup

## Prerequisites
MongoDB must be installed on the localhost

## Packages

```
cd website
npm install
cd ../bot
npm install
```

node-sass is having trouble installing for me. I didn't care to put in the effort to figure out that issue right now. This seems to be a new issue.

## Environment vars

You will need to make a file called ".env" in the project's root directory. Paste in the following environment variables, but edit it so it suites your needs. The code was not created at all to be leniant of bad configurations, so make sure you fill everything and correctly.

```
NODE_ENV=production
CLIENT_ID=YORURDISCORDCLIENTID
CLIENT_SECRET=YOURDISCORDCLIENTSECRET
BOT_TOKEN=YOURDISCORDBOTTOKEN
MEMBER_ID=YOURBOTSUSERID
#what port to run the website on
PORT=3000
#your website's domain
DOMAIN=https://yourdomain.com
COOKIE_DOMAIN=yourdomain.com
#API key for mailgun
MAILGUN_APIKEY=YOURKEYHERE

#Stripe integrations
STRIPE_PREMIUM_MONTHLY_PLAN_ID=MONTHLYPLANID
STRIPE_PREMIUM_YEARLY_PLAN_ID=YEARLYPLANID
STRIPE_API_PUBLIC=APIPUBLICKEY
STRIPE_API_SECRET=APISECRETKEY
STRIPE_WEBHOOK_SECRET=WEBHOOKSECRETKEY

```

## Starting it up

```
npm install pm2 -g
cd bot
pm2 start index.js --name bot
cd ../website
pm2 start index.js --name botwebsite
```