const fs = require('fs');
const rebootdb = require(`${__dirname}/../resources/.reboot.json`);

exports.run = async function (msg) {
    await msg.edit({ embed: {
        color: Elga.config.embedColor,
        author: { name: 'Rebooting...', icon_url: 'https://i.redd.it/ski3yupjvy4z.gif' }
    }});

    await fs.writeFileSync(`${__dirname}/../resources/.reboot.json`, JSON.stringify({
        'channelID': msg.channel.id,
        'messageID': msg.id,
        'startTime': Date.now()
    }, '', '\t'));
    process.exit();
};

exports.boot = async function () {
    if (!Elga.client.channels.get(rebootdb.channelID)) {
        return;
    }
    Elga.client.channels.get(rebootdb.channelID).fetchMessage(rebootdb.messageID).then(m => {
        const tStamp = Date.now() - rebootdb.startTime > 1000 ? `${(Date.now() - rebootdb.startTime) / 1000}s` : `${Date.now() - rebootdb.startTime}ms`;
        m.edit({ embed: {
            color: Elga.config.embedColor,
            description: 'Rebooted.',
            footer: { text: `Rebooted in ${tStamp}.` }
        } });
    }).catch(() => {});
};

exports.props = {
    name        : 'reboot',
    usage       : '{command}',
    aliases     : ['restart'],
    description : 'Reboots the selfbot.'
};
