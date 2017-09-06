exports.run = async function (Elga, msg) {
    await msg.edit({ embed: {
        color: Elga.config.embedColor,
        author: { name: 'Rebooting...', icon_url: 'http://i.imgur.com/81nH7vJ.gif' }
    } });

    const res = await Elga.db.get('SELECT * FROM reboot');
    if (!res) {
        await Elga.db.run('INSERT INTO reboot (channelID, messageID, startTime) VALUES (?, ?, ?)', msg.channel.id, msg.id, Date.now());
    } else if (res) {
        await Elga.db.run('UPDATE reboot SET channelID = ?, messageID = ?, startTime = ?', msg.channel.id, msg.id, Date.now());
    }
    process.exit();
};

exports.boot = async function (Elga) {
    const res = await Elga.db.get('SELECT * FROM reboot LIMIT 1');
    if (!res || !Elga.channels.get(res.channelID)) {
        return;
    }
    Elga.channels.get(res.channelID).fetchMessage(res.messageID).then(msg => {
        const tStamp = Date.now() - res.startTime > 1000 ? `${(Date.now() - res.startTime) / 1000}s` : `${Date.now() - res.startTime}ms`;
        msg.edit({ embed: {
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
    description : 'Reboots Elga.'
};
