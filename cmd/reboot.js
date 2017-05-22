exports.run = async function(client, msg) {
    msg.edit({ embed: {
        color: settings.embedColor,
        fields: [ { name: '\u200b', value: '**Rebooting...**' } ],
        thumbnail: { url: 'http://i.imgur.com/mIvDcFy.gif' }
    } });

    setTimeout(() => {
        msg.edit({ embed: {
            color: settings.embedColor,
            fields: [ { name: '\u200b', value: 'Rebooted.' } ],
            thumbnail: { url: 'http://i.imgur.com/mIvDcFy.gif' }
        } });
        msg.react('☑');
        }, 2500);
};

exports.props = {
    aliases: ['restart'],
    name: 'reboot',
    description: 'Reboots the selfbot.',
    usage: '{prefix}reboot'
};