const fs = require('fs');
const rebootdb = require(`${__dirname}/../resources/.reboot.json`);

exports.run = async function (msg) {
    await msg.edit({ embed: {
        color: settings.embedColor,
        author: { name: 'Rebooting...', icon_url: 'http://i.imgur.com/r9M1n1s.gif' }
    }});

    await fs.writeFileSync(`${__dirname}/../resources/.reboot.json`, JSON.stringify({
        'channelID': msg.channel.id,
        'messageID': msg.id,
        'startTime': Date.now()
    }, '', '\t'));
    process.exit();
};

exports.boot = async function () {
    const m = await client.channels.get(rebootdb.channelID).fetchMessage(rebootdb.messageID).catch(e => console.log(e));
    if (!m) return;
    const tStamp = Date.now() - rebootdb.startTime > 1000 ? `${(Date.now() - rebootdb.startTime) / 1000}s` : `${Date.now() - rebootdb.startTime}ms`;
    m.edit({ embed: {
        color: settings.embedColor,
        description: 'Rebooted.',
        footer: { text: `Rebooted in ${tStamp}.` }
    } });
};

exports.props = {
    name        : 'reboot',
    usage       : '{command}',
    aliases     : ['restart'],
    description : 'Reboots the selfbot.'
};
