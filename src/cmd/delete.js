exports.run = async function (msg, args) {
    const arg = parseInt(args[0]) ? parseInt(args[0]) : 1;
    let messages = await msg.channel.fetchMessages({ limit: 100 });
    messages = messages.array().filter(message => message.author.id === client.user.id);
    messages.length = arg + 1;
    messages.forEach(message => message.delete());
};

exports.props = {
    name        : 'del',
    usage       : '{command} <amount of messages you want to delete>',
    aliases     : ['delete', 'd'],
    description : 'Deletes a specified amount of your own messages in the channel you send it from. See the `purge` command for deleting other users\' messages.'
};