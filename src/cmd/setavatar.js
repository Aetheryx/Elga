exports.run = async function (msg, args) {
    if (!args[0])
        return msg.edit('Missing required arguments.');
    client.user.setAvatar(args.join(' '))
        .then(() => msg.edit('Avatar changed.'))
        .catch(err => msg.edit(`Something went wrong.\n${err.message}`));
};

exports.props = {
    name        : 'setavatar',
    usage       : '{command} <URL | local file>',
    aliases     : ['avatar'],
    description : 'Changes your avatar to a URL or a local file on the host machine.'
};