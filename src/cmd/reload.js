exports.run = async function (Elga, msg, args) {
    let command;
    if (Elga.commands.has(args[0])) {
        command = args[0];
    }
    else if (Elga.aliases.has(args[0])) {
        command = Elga.aliases.get(args[0]);
    }

    if (!command) {
        return msg.edit(`Command \`${args[0]}\` not found.`);
    } else {
        const m = await msg.edit(`Reloading: ${command}`);
        await Elga.reload(command).then(() => {
            m.edit(`Successfully reloaded: \`${command}\``);
        }).catch(e => {
            m.edit(`Command reload failed: ${command}\n\`\`\`${e.stack}\`\`\``);
        });
    }
};

exports.props = {
    name        : 'reload',
    usage       : '{command} <command | alias>',
    aliases     : ['rl'],
    description : 'Reloads a command.'
};