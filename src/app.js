const Discord = require('discord.js');
const schedule = require("node-schedule");

const createEmbed = require("./generator.js");
const config = require("./config.js");
const pools = require("../pools.json");

const bot = new Discord.Client()

bot.on("ready", async () => {

  const channel = await bot.channels.fetch(config.channel);
  
  if (!channel.isText()) {
    throw "Configured channel must be a text channel";
    process.exit(1);
  }

  const aprStatusJob = schedule.scheduleJob(config.cron, async () => {
    
    const channel = await bot.channels.fetch(config.channel);
    const channelMessages = await channel.messages.fetch();
    const lastMessage = channelMessages.filter(m => m.author.id === bot.user.id).first();
    try {
      const embed = await createEmbed();
    } catch (err) {
      const embed = "There was a problem while trying to fetch the latest APRs. Please check the log.";
    }

    if (lastMessage) {
      lastMessage.edit(embed);
    } else {
      channel.send(embed);
    }

  });

  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.login(config.botToken);
