const os = require('os');
const moment = require('moment');
require('moment-duration-format');

exports.run = function(client, msg) {
    let uptime;
    if (process.uptime() < 60) {
        let minutes = Math.floor((((process.uptime() % 31536000) % 86400) % 3600) / 60);
        let seconds = Math.round((((process.uptime() % 31536000) % 86400) % 3600) % 60);
        minutes = minutes > 9 ? minutes : '0' + minutes;
        seconds = seconds > 9 ? seconds : '0' + seconds;
        uptime = minutes + ':' + seconds;
    } else 
      uptime = moment.duration(process.uptime(), 'seconds').format('dd:hh:mm:ss');

    let embed = {
        color: settings.embedColor,
        title: `Elga v${settings.version}`,
        fields: [
            { name: 'Uptime', value: uptime, inline: true },
            { name: 'Websocket Ping', value: client.ping.toFixed() + 'ms', inline: true },
            { name: 'RAM Usage', value: `${((process.memoryUsage().rss / 1024) / 1024).toFixed()}MB/${os.totalmem() > 1073741824 ? (os.totalmem() / 1024 / 1024 / 1024).toFixed() + 'GB' : (os.totalmem() / 1024 / 1024).toFixed() + 'MB'}(${(process.memoryUsage().rss / os.totalmem() * 100).toFixed(2)}%)`, inline: true },
            { name: 'Libraries', value: `[Discord.js](https://discord.js.org) v${Discord.version}\nNode.js ${process.version}`, inline: true },
            { name: 'System Info', value: `${process.platform} (${process.arch})`, inline: true },
            { name: '\u200b', value: '\u200b', inline: true }
        ]
    };

    msg.edit({ embed: embed });
};

exports.props = {
aliases: ['info'],
name: 'stats',
description: 'Returns statistics about the selfbot.',
usage: '{prefix}stats'
};