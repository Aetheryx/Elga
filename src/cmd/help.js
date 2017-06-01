exports.run = function(msg, args) {
  if (!args[0])
        return msg.edit({ embed: {
            title: `Commands (${client.commands.size})`,
            description: client.commands.map(cmd => cmd.props.name).sort().join(', ')
        } }); 

    if (!client.commands.has(args[0]) && !client.aliases.has(args[0]))
        return msg.edit(`Command ${args[0]} not found.`);

        let props = client.commands.has(args[0]) ? client.commands.get(args[0]).props : client.commands.get(client.aliases.get(args[0])).props;
        msg.edit({ embed: {
            title: 'Help for command: ' + props.name,
            color: settings.embedColor,
            fields: [
                { 'name': 'Description: ', 'value': props.description, inline: false },
                { 'name': 'Usage: ', 'value': props.usage.replace(/{command}/g, settings.prefix + props.name), inline: false }, 
                { 'name': 'Aliases: ', 'value': (props.aliases[0] ? props.aliases.join(', ') : 'None'), inline: false }
            ]
        } });
};

exports.props = {
    name        : 'help',
    usage       : '{command}\n{command} <command | alias>',
    aliases     : [],
    description : 'Returns help for specific commands.'
};