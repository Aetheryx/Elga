exports.run = function(client, msg, args) {
  if (!args[0])
        return msg.edit({ embed: {
            title: `Commands (${client.commands.size})`,
            description: client.commands.map(x => x.props.name).sort().join(', ')
        } }); 


    if (!client.commands.has(args[0]))
        return msg.edit(`Command ${args[0]} not found.`)

        let props = client.commands.get(args[0]).props

        console.log(JSON.stringify(props, '', '\t'))

        msg.edit({ embed: {
            title: 'Help for command: ' + props.name,
            color: settings.embedColor,
            fields: [
                { 'name': 'Description: ', 'value': props.description, inline: false },
                { 'name': 'Usage: ', 'value': props.usage.replace('{prefix}', settings.prefix), inline: false },
                { 'name': 'Aliases: ', 'value': (props.aliases[0] ? props.aliases.join(', ') : 'None' ), inline: false }
            ]
        } });
};

exports.props = {
aliases: [],
name: 'help',
description: 'Help command',
usage: `{prefix}help\n{prefix}help <command name>`
};