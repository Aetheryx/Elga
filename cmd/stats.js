const os = require('os');
const moment = require('moment');
const { version } = require('discord.js');
require('moment-duration-format');

exports.run = function (Elga, msg) {
    const uptime = process.uptime() < 60 ?
        `00:${process.uptime() > 10 ? process.uptime().toFixed() : `0${process.uptime().toFixed()}`}` : // eslint-disable-line prefer-template
        moment.duration(process.uptime(), 'seconds').format('dd:hh:mm:ss');

    msg.edit({ embed: {
        color: Elga.config.embedColor,
        title: `Elga v${Elga.config.version}`,
        fields: [
            { name: 'Uptime', value: uptime, inline: true },
            { name: 'Websocket Ping', value: `${Elga.ping.toFixed()}ms`, inline: true },
            { name: 'RAM Usage', value: `${(process.memoryUsage().rss / 1024 / 1024).toFixed()}MB/${os.totalmem() > 1073741824 ? `${(os.totalmem() / 1024 / 1024 / 1024).toFixed()}GB` : `${(os.totalmem() / 1024 / 1024).toFixed()}MB`}(${(process.memoryUsage().rss / os.totalmem() * 100).toFixed(2)}%)`, inline: true },
            { name: 'Libraries', value: `[Discord.js](https://discord.js.org) v${version}\nNode.js ${process.version}`, inline: true },
            { name: 'System Info', value: `${process.platform} (${process.arch})`, inline: true },
            { name: '\u200b', value: '\u200b', inline: true }
        ]
    } });
};

exports.props = {
    name        : 'stats',
    usage       : '{command}',
    aliases     : ['info'],
    description : 'Returns statistics about the selfbot.'
};