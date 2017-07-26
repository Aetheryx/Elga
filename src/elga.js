const { Client, Collection } = require('discord.js');
const db = require('sqlite');
db.open(`${__dirname}/elgadb.sqlite`);
const fs = require('fs');
const ElgaLogger = require(`${__dirname}/util/logger.js`);
const prebuilts = require(`${__dirname}/util/prebuilts.js`);

module.exports = class Elga extends Client {
    constructor (config, customfns) {
        super();
        this.log = new ElgaLogger();
        this.log.info('Logging in..');
        this.db = db;
        this.commands = new Collection();
        this.aliases  = new Collection();
        this.config = config;
        this.customfns = customfns;
        this.parseConfig(config, customfns || {});
        this.commandCache = { reddit: [], fml: [] };
        this.login(this.config.token);
        this.on('ready', this.onReady);
        this.once('ready', this.onceReady);
        this.on('message', this.onMessage);
    }

    parseConfig (config, customfns) {
        if (typeof config === 'string') {
            this.config = require(this.config);
        } else if (typeof config !== 'object' || config === null) {
            throw new TypeError('The provided config argument needs to be an object or a path to the config file.', __filename);
        }
        if (typeof this.config.token !== 'string') {
            throw new TypeError('The provided token needs to be a string.', __filename);
        }
        if (!this.config.embedColor) {
            this.log.warn('No embed color provided in config. Using #2E0854.');
        }

        this.config.tags       = Object.assign(customfns.tags || {}, prebuilts.tags);
        this.config.replaces   = Object.assign(customfns.tags || {}, prebuilts.replaces);
        this.config.version    = require(`${__dirname}/../package.json`).version;
        this.config.embedColor = this.config.embedColor ? this.resolver.resolveColor(this.config.embedColor) : parseInt('2E0854', '16');
    }

    onReady () {
        this.log.info(`Logged in as ${this.user.tag}, running Elga v${this.config.version}.`);
        delete this.user.email;
    }

    async onceReady () {
        require(`${__dirname}/cmd/reboot.js`).boot(this);
        this.loadCommands();
        this.initTables();
        if (this.config.autoReload) {
            this.initAutoReload();
        }
    }

    loadCommands () {
        fs.readdir(`${__dirname}/cmd/`, (err, files) => {
            if (err) {
                return this.log.error(err);
            }
            this.log.info(`Loading a total of ${files.length} commands.`);

            files.forEach(file => {
                try {
                    const command = require(`./cmd/${file}`);
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
            } catch (err) {
                this.log.error(`Failed to reload ${command},\n${err.stack}`);
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
        await this.db.run(`CREATE TABLE IF NOT EXISTS memo (
            memoID INTEGER,
            memoText TEXT);`);
    }

    async onMessage (msg) {
        if (msg.author.id !== this.user.id) {
            return;
        }

        let message = msg.content;

        Object.keys(this.config.replaces)
            .filter(word => message.includes(word))
            .map(word => {
                const emojiRegex = new RegExp(`<:[a-z]*${word}[a-z]*:[0-9]*>`, 'gi');
                if (!emojiRegex.test(message)) {
                    message = message.replace(new RegExp(word, 'gi'), this.config.replaces[word]);
                }
            });

        Object.keys(this.config.tags)
            .filter(tag => message.includes(`<${tag}>`))
            .map(tag => {
                const regex = new RegExp(`<${tag}>(.*?)</${tag}>`);
                message = message.replace(regex, (_, str) => this.config.tags[tag](str));
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
                await cmd.run(this, msg, args);
            } catch (err) {
                this.cmdErr(msg, err);
            }
        }
    }

    missingArgsError (msg, props) {
        msg.edit(`Missing required argument(s). Send \`${this.config.prefix}help ${props.name}\` to view the syntax of this command.`);
    }

    codeblock (str, lang) {
        return '```' + (lang || '') + '\n' + str + '\n```'; // eslint-disable-line prefer-template
    }

    cmdErr (msg, err) {
        msg.edit({ embed: {
            color: 0xFF0000,
            title: ':warning: Something went wrong.',
            description: this.codeblock(err.stack.length < 1900 ? err.stack : err.message)
        }});
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
};



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
