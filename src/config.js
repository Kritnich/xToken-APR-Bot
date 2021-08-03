let config;

try {
  config = require("../config.json");
} catch (error) {
  config = null;
}

module.exports.botToken = config ? config.bot_token : process.env.XTK_BOT_TOKEN;
module.exports.channel = config ? config.channel : process.env.XTK_CHANNEL;
module.exports.cron = config ? config.cron : process.env.XTK_CRON;
