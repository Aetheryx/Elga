exports.run = async function (msg, args) {
    const arg = parseInt(args[0]) ? parseInt(args[0]) : 1;
    let messages = await msg.channel.fetchMessages({ limit: 100 });
    messages = messages.array().filter(message => message.author.id === client.user.id);
    messages.length = arg + 1;
    messages.forEach(message => message.delete());
};

exports.props = {   
    aliases     : ['delete', 'd'],
    name        : 'del',
    description : 'Deletes a specified amount of your messages in the channel you send it from.',
    usage       : '{prefix}del <amount of messages you want to delete>'
};