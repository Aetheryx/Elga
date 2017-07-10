/* Completed commands:

 * delete
 * ping
 * stats
 * emoji
 * translate
 * reload
 * help

 * WIP:
 * fml
 * reboot (gif, specifically)
 * reddit
 * tags (~~Fuck level. Mongo? SQL?~~ Yes, SQL.)

 * Targets:
 * AFK settings
 * ~~Command prediction based on percentage of matched characters~~ meh
 * Playing status
 *
*/
const fs = require('fs');
const Discord = require('discord.js');
client = new Discord.Client();
settings = require(`${__dirname}/settings.json`);
const sqlite = require('sqlite');
const db = (async () => { const db = await sqlite.open('elgadb'); return db; })(); // god plz forgib me

console.log('Logging in...');

client.login(settings.token);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}.`);
});


client.once('ready', async () => {
    require(`${__dirname}/cmd/reboot.js`).boot();

    client.commands = new Discord.Collection();
    client.aliases  = new Discord.Collection();
    client.redditdb = new Array();
    client.missingArgsError = (msg, props) => {
        msg.edit(`Missing required argument(s). Send \`${settings.prefix}help ${props.name}\` to view the syntax of this command.`);
    }

    fs.readdir(`${__dirname}/cmd/`, (err, files) => {
        if (err) 
            return console.error(err);
        console.log(`Loading a total of ${files.length} commands.`);

        files.forEach(file => {
            const command = require(`./cmd/${file}`);
            console.log(`Loading Command: ${command.props.name}`);
            client.commands.set(command.props.name, command);

            command.props.aliases.forEach(alias => client.aliases.set(alias, command.props.name));
        });
    });

    require('chokidar').watch(`${__dirname}/cmd/`).on('change', async (path) => {
        const command = require('path').basename(path).slice(0, -3);
        try {
            await client.reload(command);
            console.log(`Reloaded ${command}.`);
        } catch (e) {
            console.log(`Failed to reload ${command},\n${e}`);
        }
    });
});

client.on('message', async (msg) => {
    console.log(db);
    if (msg.author.id !== client.user.id) return;

    const emojiRegex = /<:[a-z]*shrug[a-z]*:[0-9]*>/g;

    Object.keys(settings.replaces).filter(word => msg.content.toLowerCase().includes(word)).forEach(word => {
        if (!emojiRegex.test(msg.content)) 
            msg.edit(msg.content.replace(word, settings.replaces[word])); 
    });

    if (!msg.content.startsWith(settings.prefix)) return;
    let command = msg.content.split(' ')[0].slice(settings.prefix.length);
    let cmd;
    if (client.commands.has(command))
        cmd = client.commands.get(command);
    else if (client.aliases.has(command))
        cmd = client.commands.get(client.aliases.get(command));


    if (cmd) {
        const args = msg.content.split(' ').slice(1);
        // let startTime = Date.now()
        try {
            cmd.run(msg, args, db);
        } catch (err) {
            msg.edit({ embed: {
                title: ':warning: Something went wrong.',
                description: '```\n' + err.stack + '\n```' // eslint-disable-line prefer-template
            }});
        // msg.channel.send("Execution time: " + (Date.now() - startTime) + " ms")
        }
    }
});

client.reload = function (command) {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./cmd/${command}`)];
            const cmd = require(`./cmd/${command}`);
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