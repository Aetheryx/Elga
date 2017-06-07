exports.run = async function (msg, args) {
    if (args.join(' ').length > 128)
        return msg.edit({ embed: {
            color: settings.embedColor,
            description: 'You can\'t set your nickname to something that long.'
        } });
    await client.user.setGame(args.join(' '));
    msg.edit({ embed: {
        color: settings.embedColor,
        description: args[0] ? `Playing status set to ${client.user.presence.game.name}.` : 'Playing status cleared.'
    }});
};

exports.props = {
    name        : 'setgame',
    usage       : '{command} <game status to set>',
    aliases     : ['game'],
    description : 'Sets your Playing status to whatever you want.'
};