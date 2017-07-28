const { Client, Collection, Constants } = require('discord.js');
const fs = require('fs');
const { join, basename } = require('path');
const prebuilts = require(join(__dirname, 'util', 'prebuilts.js'));
const log = require(join(__dirname, 'util', 'logger.js'));

class Elga extends Client {
    constructor (config, db, absPath) {
        super(config.clientOptions || prebuilts.clientOptions);
        this.absPath = absPath;
        this.log = log;
        this.db = db;
        this.initTables();
        this.log('Why are you here? Go away. Elga is still in dev.\nSeriously though. Continue at your own risk. High RAM usage and bugs await you. Turn back while you can!!', 'warn');
        this.log('Logging in..');
        this.commands = new Collection();
        this.aliases  = new Collection();
        this.config = config;
        this.commandCache = { reddit: [], fml: [] };
        this.loadCommands(join(__dirname, 'cmd'), true);
        this.login(this.config.token);
        this.on('ready', this.onReady);
        this.once('ready', this.onceReady);
        this.on('message', this.onMessage);
    }

    onReady () {
        this.log(`Logged in as ${this.user.tag}, running Elga v${this.config.version}.`);
        this.user.setGame(this.config.playingStatus);
        delete this.user.email;
    }

    async onceReady () {
        require(join(__dirname, 'cmd', 'reboot.js')).boot(this);
    }

    loadCommands (path, prebuilt) {
        path = prebuilt ? join(__dirname, 'cmd') : join(this.absPath, path);
        fs.readdir(path, (err, files) => {
            if (err) {
                return this.log(err, 'error');
            }
            this.log(`Loading ${files.length} ${prebuilt ? 'default' : 'custom'} commands.`);

            files.forEach(file => {
                try {
                    const command = require(join(path, file));
                    this.commands.set(command.props.name, command);
                    command.props.aliases.forEach(alias => this.aliases.set(alias, command.props.name));
                } catch (err) {
                    this.log(`Error while loading ${file}:\n${err.stack}`, 'error');
                }
            });
        });
        if (this.config.autoReload) {
            this.initAutoReload(path);
        }
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
            memoID   INTEGER,
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
        return `${'```'}${lang || ''}\n${str}\n${'```'}`;
    }

    cmdErr (msg, err) {
        msg.edit({ embed: {
            color: 0xFF0000,
            title: ':warning: Something went wrong.',
            description: this.codeblock(err.stack.length < 1500 ? err.stack : err.message)
        } });
        this.log(`Error while running command ${msg.content.slice(this.config.prefix.length).split(' ')[0]} with args ${JSON.stringify(msg.content.split(' ').slice(1))}:\n${err.stack}`, 'error');
    }

    initAutoReload (path) {
        require('chokidar').watch(path).on('change', async (cPath) => {
            const command = basename(cPath).slice(0, -3);
            try {
                await this.reload(command, path);
                this.log(`Reloaded ${command}.`);
            } catch (err) {
                this.log(`Failed to reload ${command},\n${err.stack}`, 'error');
            }
        });
    }

    reload (command, path) {
        return new Promise((resolve, reject) => {
            try {
                delete require.cache[require.resolve(join(path, command))];
                const cmd = require(join(path, command));
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

exports.create = async (config, customfns) => {
    const absPath = process.mainModule.filename.replace(basename(process.mainModule.filename), '');
    if (typeof config === 'string') {
        const src = config;
        config = require(join(absPath, config));
        config.src = join(absPath, src);
    } else if (typeof config !== 'object' || config === null) {
        throw new TypeError('The provided config argument needs to be an object or a path to the config file.', __filename);
    }
    if (typeof config.token !== 'string') {
        throw new TypeError('The provided token needs to be a string.', __filename);
    }
    if (!config.embedColor) {
        log('No embed color provided in config. Using #2E0854.', 'warn');
    }

    config.tags       = Object.assign(customfns ? customfns.tags || {} : {}, prebuilts.tags); // this, or if (!customfns) customfns = {}
    config.replaces   = Object.assign(customfns ? customfns.replaces || {} : {}, prebuilts.replaces);
    config.version    = require(join(__dirname, 'package.json')).version;
    config.embedColor = config.embedColor ? resolveColor(config.embedColor) : parseInt('2E0854', '16');

    const db = require('sqlite');
    await db.open(join(absPath, 'database.db'));

    return new Elga(config, db, absPath);
};

function resolveColor (color) {
    if (typeof color === 'string') {
        if (color === 'RANDOM') {
            return Math.floor(Math.random() * (0xFFFFFF + 1));
        }
        color = Constants.Colors[color] || parseInt(color.replace('#', ''), 16);
    } else if (color instanceof Array) {
        color = (color[0] << 16) + (color[1] << 8) + color[2];
    }

    if (color < 0 || color > 0xFFFFFF) {
        throw new RangeError('COLOR_RANGE');
    } else if (color && isNaN(color)) {
        throw new TypeError('COLOR_CONVERT');
    }
    return color;
}

process.on('unhandledRejection', err => {
    log(`Unhandled rejection: \n${err.stack}`, 'error');
});


process.on('uncaughtException', err => {
    log(`UNCAUGHT EXCEPTION: \n${err.stack}`, 'error');
});