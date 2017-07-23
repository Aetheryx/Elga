const { Client, Collection } = require('discord.js');
const db = require('sqlite');
db.open(`${__dirname}/elgadb.sqlite`);
const fs = require('fs');
const ElgaLogger = require(`${__dirname}/util/logger.js`);
const prebuilts = require(`${__dirname}/util/prebuilts.js`);

class Elga {
    constructor (config) {
        this.client = new Client();
        this.db = db;
        this.config = config;
        this.commands = new Collection();
        this.aliases  = new Collection();
        this.log = new ElgaLogger();
        this.commandCache = { reddit: [], fml: [] };
        this.client.login(config.token);
        this.log.info('Logging in..');
        this.client.on('ready', this.onReady.bind(this));
        this.client.once('ready', this.onceReady.bind(this));
        this.client.on('message', this.onMessage.bind(this));
    }

    onReady () {
        this.log.info(`Logged in as ${this.client.user.tag}.`);
        delete this.client.user.email;
    }

    async onceReady () {
        require(`${__dirname}/cmd/reboot.js`).boot(this);
        this.parseConfig();
        this.loadCommands();
        this.initTables();
        if (this.config.autoReload) {
            this.initAutoReload();
        }
    }

    parseConfig () {
        this.config.embedColor = this.client.resolver.resolveColor(this.config.embedColor);
        this.config.version = require(`${__dirname}/../package.json`).version;
        this.config.tags = Object.assign(this.config.tags || {}, prebuilts.tags);
        this.config.replaces = Object.assign(this.config.replaces || {}, prebuilts.replaces);
    }

    loadCommands () {
        fs.readdir(`${__dirname}/cmd/`, (err, files) => {
            if (err) {
                return this.log.error(err);
            }
            this.log.info(`Loading a total of ${files.length} commands.`);

            files.forEach(file => {
                let command;
                try {
                    command = require(`./cmd/${file}`);
                    this.commands.set(command.props.name, command);
                    command.props.aliases.forEach(alias => this.aliases.set(alias, command.props.name));
                } catch (err) {
                    this.log.error(`Error while loading ${file}:\n${err.stack}`);
                }
            });
        });
    }

    initAutoReload () {
        require('chokidar').watch(`${__dirname}/cmd/`).on('change', async (path) => {
            const command = require('path').basename(path).slice(0, -3);
            try {
                await this.reload(command);
                this.log.info(`Reloaded ${command}.`);
            } catch (e) {
                this.log.error(`Failed to reload ${command},\n${e}`);
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
        await this.db.run(`CREATE TABLE IF NOT EXISTS reboot (
            channelID TEXT,
            messageID TEXT,
            startTime INTEGER);`);
    }

    async onMessage (msg) {
        if (msg.author.id !== this.client.user.id) {
            return;
        }

        let message = msg.content;

        const emojiRegex = /<:[a-z]*shrug[a-z]*:[0-9]*>/g;
        Object.keys(this.config.replaces)
            .filter(word => message.includes(word))
            .map(word => {
                if (!emojiRegex.test(message)) {
                    message = message.replace(new RegExp(word, 'gi'), this.config.replaces[word]);
                }
            });

        Object.keys(this.config.tags)
            .filter(tag => message.includes(`<${tag}>`))
            .map(tag => {
                const regex = new RegExp(`<${tag}>(.*?)</${tag}>`);
                message = message.replace(regex, this.config.tags[tag]);
            });

        if (msg.content !== message) {
            msg.edit(message);
        }

        if (!msg.content.startsWith(this.config.prefix)) {
            return;
        }
        const command = msg.content.slice(this.config.prefix.length).split(' ')[0];
        let cmd;
        if (this.commands.has(command)) {
            cmd = this.commands.get(command);
        } else if (this.aliases.has(command)) {
            cmd = this.commands.get(this.aliases.get(command));
        }

        if (cmd) {
            const args = msg.content.split(' ').slice(1);
            try {
                cmd.run(this, msg, args);
            } catch (err) {
                msg.edit({ embed: {
                    title: ':warning: Something went wrong.',
                    description: '```\n' + err.stack + '\n```' // eslint-disable-line prefer-template
                }});
            }
        }
    }

    missingArgsError (msg, props) {
        msg.edit(`Missing required argument(s). Send \`${this.config.prefix}help ${props.name}\` to view the syntax of this command.`);
    }

    reload (command) {
        return new Promise((resolve, reject) => {
            try {
                delete require.cache[require.resolve(`./cmd/${command}`)];
                const cmd = require(`${__dirname}/cmd/${command}`);
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

new Elga({
    prefix: '.',
    token: 'mfa.FjciRHIxxO6fFNd_A3zhbY6qu1dwyn-KPZPNYpDGYYS6gtBxKPiLRCzqri-DWs-aAx8W1TMnVAyc4OnCT2Gi',
    embedColor: '#FF0000',
    autoReload: true
});

/* Progress
 * WIP:
 * fml
 * reboot (gif, mostly)
 * reddit (LINT!)
 * tags

 * Targets:
 * AFK settings
 * Playing status
 * Some solution for saving prefixes permanently and not per-session
 *
*/
