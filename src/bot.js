const { Client, Collection } = require('discord.js');
const db = require('sqlite');
db.open(`${__dirname}/elgadb.sqlite`);
const fs = require('fs');

class ElgaClass {
    constructor () {
        this.client = new Client();
        this.db = db;
        this.settings = require(`${__dirname}/settings.json`);
        this.commands = new Collection();
        this.aliases  = new Collection();
        this.log = new ElgaLogger();
        this.commandCache = { reddit: [], fml: [] };
        this.client.login(this.settings.token);
        console.log('Logging in..');
        this.client.on('ready', this.onReady.bind(this));
        this.client.once('ready', this.onceReady.bind(this));
        this.client.on('message', this.onMessage.bind(this));
    }

    onReady () {
        console.log(`Logged in as ${this.client.user.tag}.`);
    }

    async onceReady () {
        require(`${__dirname}/cmd/reboot.js`).boot();
        this.loadCommands();
        this.initTables();
        if (this.settings.autoReload) {
            this.initAutoReload();
        }
    }

    loadCommands () {
        fs.readdir(`${__dirname}/cmd/`, (err, files) => {
            if (err) {
                return console.error(err);
            }
            console.log(`Loading a total of ${files.length} commands.`);

            files.forEach(file => {
                const command = require(`./cmd/${file}`);
            //    console.log(`Loading Command: ${command.props.name}`);
                this.commands.set(command.props.name, command);

                command.props.aliases.forEach(alias => this.aliases.set(alias, command.props.name));
            });
        });
    }

    initAutoReload () {
        require('chokidar').watch(`${__dirname}/cmd/`).on('change', async (path) => {
            const command = require('path').basename(path).slice(0, -3);
            try {
                await this.reload(command);
                console.log(`Reloaded ${command}.`);
            } catch (e) {
                console.log(`Failed to reload ${command},\n${e}`);
            }
        });
    }

    async initTables () {
        await this.db.run(`CREATE TABLE IF NOT EXISTS tags (
            tagName    TEXT,
            tagContent TEXT);`);
        await this.db.run(`CREATE TABLE IF NOT EXISTS messages (
            content          TEXT,
            authorTag        TEXT,
            authorID         INTEGER,
            channelID        INTEGER,
            channelName      TEXT,
            guildName        TEXT,
            createdTimestamp INTEGER);`);
    }

    async onMessage (msg) {
        if (msg.author.id !== this.client.user.id) {
            return;
        }

        const emojiRegex = /<:[a-z]*shrug[a-z]*:[0-9]*>/g;
        Object.keys(this.settings.replaces)
            .filter(word => msg.content.toLowerCase().includes(word))
            .forEach(word => {
                if (!emojiRegex.test(msg.content)) {
                    msg.edit(msg.content.replace(word, this.settings.replaces[word]));
                }
            });

        if (!msg.content.startsWith(this.settings.prefix)) {
            return;
        }
        const command = msg.content.split(' ')[0].slice(this.settings.prefix.length);
        let cmd;
        if (this.commands.has(command)) {
            cmd = this.commands.get(command);
        } else if (this.aliases.has(command)) {
            cmd = this.commands.get(this.aliases.get(command));
        }

        if (cmd) {
            const args = msg.content.split(' ').slice(1);
            try {
                cmd.run(msg, args);
            } catch (err) {
                msg.edit({ embed: {
                    title: ':warning: Something went wrong.',
                    description: '```\n' + err.stack + '\n```' // eslint-disable-line prefer-template
                }});
            }
        }
    }

    missingArgsError (msg, props) {
        msg.edit(`Missing required argument(s). Send \`${this.settings.prefix}help ${props.name}\` to view the syntax of this command.`);
    }

    reload (command) {
        return new Promise((resolve, reject) => {
            try {
                delete require.cache[require.resolve(`./cmd/${command}`)];
                const cmd = require(`./cmd/${command}`);
                this.commands.delete(command);

                this.aliases.forEach((cmd, alias) => {
                    if (cmd === command) {
                        this.aliases.delete(alias);
                    }
                });

                this.commands.set(command, cmd);
                cmd.props.aliases.forEach(alias => {
                    this.aliases.set(alias, cmd.props.name);
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }
}

class ElgaLogger {
    constructor () {}
    info (text) {
        console.log(`[${Date().toString().split(' ').slice(1, 5).join(' ')}] `.green + text);
    }
    warn (text) {
        console.log(`[${Date().toString().split(' ').slice(1, 5).join(' ')}] `.yellow + text);
    }
    error (text) {
        console.log(`[${Date().toString().split(' ').slice(1, 5).join(' ')}] `.red + text);
    }
};

Elga = new ElgaClass();

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
 * reboot (gif, mostly)
 * reddit (LINT!)
 * tags

 * Targets:
 * AFK settings
 * Playing status
 *
*/
