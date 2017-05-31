const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
client = new Discord.Client();
settings = require(path.join(__dirname, 'settings.json'));
//const levelup = require('level');
//db = levelup('./testdb');
//require('level-promise').install(db);

console.log('Logging in...');

client.login(settings.token);

client.on('ready', () => console.log('Logged in as ' + client.user.tag));

client.once('ready', async () => {
    require(path.join(__dirname, 'cmd/reboot.js')).boot();

    client.commands = new Discord.Collection();
    client.aliases = new Discord.Collection();
    client.redditDB = new Array();

    fs.readdir(path.join(__dirname, 'cmd'), (err, files) => {
        if (err) console.error(err);
        console.log(`Loading a total of ${files.length} commands.`);

         files.forEach(file => {
            let command = require(`./cmd/${file}`);
            console.log(`Loading Command: ${command.props.name}`);
            client.commands.set(command.props.name, command);

            command.props.aliases.forEach(alias => {
                client.aliases.set(alias, command.props.name);
            });
        });
    });


    fs.watch(path.join(__dirname, 'cmd'), async (eventType, filename) => {
        if (eventType === 'change') {
            let command = filename.replace('.js', '');
            try {
                await client.reload(command);
                console.log('Reloaded ' + command);
            } catch (e) {
                console.log('Failed to reload ' + command + ',\n' + e);
            }
        }
    });
});

client.on('message', (msg) => {
    if (msg.author.id !== client.user.id) return;

    Object.keys(settings.replaces).filter((word) => msg.content.toLowerCase().includes(word)).forEach((word) => {
        msg.edit(msg.content.replace(word, settings.replaces[word])); // use regex for emojis
    });

    if (!msg.content.startsWith(settings.prefix)) return;
    const command = msg.content.split(' ')[0].slice(settings.prefix.length);

    let cmd;

    if (client.commands.has(command))
        cmd = client.commands.get(command);
    else if (client.aliases.has(command))
        cmd = client.commands.get(client.aliases.get(command));

    if (cmd) {
        const args = msg.content.split(' ').slice(1);
        //let startTime = Date.now()
        cmd.run(msg, args);
        //msg.channel.send("Execution time: " + (Date.now() - startTime) + " ms")
    }
});

client.reload = function(command) {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./cmd/${command}`)];
            let cmd = require(`./cmd/${command}`);
            client.commands.delete(command);

            client.aliases.forEach((cmd, alias) => {
                if (cmd === command)
                    client.aliases.delete(alias);
            });

            client.commands.set(command, cmd);
            cmd.props.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.props.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};
