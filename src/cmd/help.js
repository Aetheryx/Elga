exports.run = function (msg, args) {
    if (!args[0]) {
        return msg.edit({ embed: {
            title: `Commands (${Elga.commands.size})`,
            description: Elga.commands.map(cmd => cmd.props.name).sort().join(', ')
        } });
    }

    if (!Elga.commands.has(args[0]) && !Elga.aliases.has(args[0])) {
        return msg.edit(`Command ${args[0]} not found.`);
    }

    const props = Elga.commands.has(args[0]) ? Elga.commands.get(args[0]).props : Elga.commands.get(Elga.aliases.get(args[0])).props;
    msg.edit({ embed: {
        title: `Help for command: ${props.name}`,
        color: Elga.settings.embedColor,
        fields: [
            { 'name': 'Description: ', 'value': props.description, inline: false },
            { 'name': 'Usage: ', 'value': props.usage.replace('{command}', Elga.settings.prefix + props.name), inline: false },
            { 'name': 'Aliases: ', 'value': props.aliases[0] ? props.aliases.join(', ') : 'None', inline: false }
        ]
    } });
};

exports.props = {
    name        : 'help',
    usage       : '{command}\n{command} <command | alias>',
    aliases     : [],
    description : 'Returns help for specific commands.'
};