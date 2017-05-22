const fs = require('fs');
let rebootdb = require('../resources/reboot.json')
exports.run = async function(client, msg) {
    msg.edit({ embed: {
        color: settings.embedColor,
        fields: [ { name: '\u200b', value: '**Rebooting...**' } ],
        thumbnail: { url: 'http://i.imgur.com/mIvDcFy.gif' }
    } });

    fs.writeFileSync('./resources/reboot.json', JSON.stringify({
        'channelID': msg.channel.id,
        'messageID': msg.id,
        'startTime': Date.now()
    }, '', '\t')) 
};

exports.boot = async function() {
    let m = await client.channels.get(rebootdb.channelID).fetchMessage(rebootdb.messageID)
    let tStamp = Date.now() - rebootdb.startTime > 1000 ? (Date.now() - rebootdb.startTime) / 1000 + 's' : Date.now() - rebootdb.startTime + 'ms'
    m.edit({ embed: {
        color: settings.embedColor,
        fields: [ { name: '\u200b', value: 'Rebooted.    ' } ],
        thumbnail: { url: 'http://i.imgur.com/iEQkW7Y.png' },
        footer: { text: `Rebooted in ${tStamp}.` }
    } });
}

exports.props = {
    aliases: ['restart'],
    name: 'reboot',
    description: 'Reboots the selfbot.',
    usage: '{prefix}reboot'
};


