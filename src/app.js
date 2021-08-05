const { WebhookClient } = require('discord.js');
const createEmbed = require("./generator.js");

const url = process.argv[2];
const webhook = new WebhookClient({ url });

createEmbed().then(embed => {
  webhook.send({
    embeds: [embed]
  });
});

