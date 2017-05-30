exports.run = async function(msg, args) {
    let command;
    if (client.commands.has(args[0])) {
        command = args[0];
    } else if (client.aliases.has(args[0])) {
        command = client.aliases.get(args[0]);
    }
    if (!command) {
        return msg.edit(`I cannot find the command \`${args[0]}\`.`);
    } else {
        let m = await msg.edit(`Reloading: ${command}`);
        try {
            await client.reload(command);
            await m.edit(`Successfully reloaded: \`${command}\``);
        } catch (e) {
            m.edit(`Command reload failed: ${command}\n\`\`\`${e.stack}\`\`\``);
        };
    };
};

exports.props = {
    aliases: ['rl'],
    name: "reload",
    description: "Reloads a command.",
    usage: `${settings.prefix}reload <arg>`
};