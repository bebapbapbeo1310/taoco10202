const { PREFIX, LAVA_HOST, LAVA_PASSWORD, LAVA_PORT  } = require('../../config');
const { MessageEmbed } = require("discord.js")

module.exports = async bot => {
    console.log(`${bot.user.username} is available now!`)
    var activities = [ `81 Servers`, `721832 Users!` ], i = 0;
    setInterval(() => bot.user.setActivity(`${PREFIX}help`, { type: "WATCHING" }),500)
    
};
