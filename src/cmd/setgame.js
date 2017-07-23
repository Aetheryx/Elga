exports.run = async function (Elga, msg, args) {
    if (args.join(' ').length > 128) {
        return msg.edit({ embed: {
            color: Elga.config.embedColor,
            description: 'You can\'t set your game to something that long.'
        } });
    }
    await Elga.client.user.setGame(args.join(' '));
    msg.edit({ embed: {
        color: Elga.config.embedColor,
        description: args[0] ? `Playing status set to ${Elga.client.user.presence.game.name}.` : 'Playing status cleared.'
    } });
};

exports.props = {
    name        : 'setgame',
    usage       : '{command} <game status to set>',
    aliases     : ['game'],
    description : 'Sets your Playing status to whatever you want.'
};