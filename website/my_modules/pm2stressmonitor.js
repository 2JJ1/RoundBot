const pm2 = require("pm2")

var CPUStressCount = 0
var started = false

//Check every 10 seconds if the bot is being stressed
module.exports = function(){
    //Only run this once so there isn't too many timers
    if(started === true) return
    started = true

    if(process.env.NODE_ENV !== "production") return console.warn("Not production mode, so CPU stress monitoring is disabled")

    try{
        //Start checking every 10 seconds
        setInterval(function(){
            //Promisify so I can pm2.disconnect after the asynchronous operations
            pm2.connect(function(err) {
                if(err) console.error(err)

                pm2.describe("bot", (err, data) => {
                    if(err) console.error(err)
                    
                    if(data.length <= 0) throw new Error("Bot process not found for pm2 monitoring")

                    if(data[0].monit.cpu > 70){
                        CPUStressCount += 1
                        if(CPUStressCount >= 3) {
                            /* The bot's CPU has been above 70% for 30 seconds. A specific attack has caused the CPU to spike and
                            caused extremely high latency. Restarting the bot seemed to help every time. */
                            console.log("Restarting bot PM2 process due to high CPU usage...")
                            pm2.restart("bot", err => {
                                if(err) console.error(err)
                            })
                        }
                    }
                    else CPUStressCount = 0
                })
            })
        }, 1000 * 10)
    }
    catch(e){
        console.log(e)
    }
}