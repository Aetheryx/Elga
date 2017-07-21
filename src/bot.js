const { Client, Collection } = require('discord.js');
const db = require('sqlite');
db.open(`${__dirname}/elgadb.sqlite`);
const fs = require('fs');
const ElgaLogger = require(`${__dirname}/util/logger.js`);
const prebuilts = {
    tags: {
        emojify: (undefined, str) => {
            const specialCodes = {
                '0': ':zero: ',
                '1': ':one: ',
                '2': ':two: ',
                '3': ':three: ',
                '4': ':four: ',
                '5': ':five: ',
                '6': ':six: ',
                '7': ':seven: ',
                '8': ':eight: ',
                '9': ':nine: ',
                '#': ':hash: ',
                '*': ':asterisk: ',
                '?': ':grey_question: ',
                '!': ':grey_exclamation: ',
                ' ': '   '
            };
            return str.toLowerCase().split('').map(letter => {
                if (/[a-z]/g.test(letter)) {
                    return `:regional_indicator_${letter}: `;
                } else if (specialCodes[letter]) {
                    return specialCodes[letter];
                }
                return letter;
            }).join('');
        },
        super: (undefined, str) => {
            const normals = ' 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            const supers = ' ⁰¹²³⁴⁵⁶⁷⁸⁹ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᑫʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᑫᴿˢᵀᵁⱽᵂˣʸᶻ'.split('');
            return str.split('').map(char => {
                if (normals.includes(char)) {
                    return supers[normals.indexOf(char)];
                } else {
                    return char;
                }
            }).join('');
        },
        upsidedown: (undefined, str) => {
            const normals = ' 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            const upsidedowns = ' 0ƖᄅƐㄣϛ9ㄥ86ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz∀qƆpƎℲפHIſʞ˥WNOԀQɹS┴∩ΛMX⅄Z'.split('');
            return str.split('').map(char => {
                if (normals.includes(char)) {
                    return upsidedowns[normals.indexOf(char)];
                } else {
                    return char;
                }
            }).join('');
        },
        flip: (undefined, str) => {
            return str.split('').reverse().join('');
        }
    },
    replaces: {
        shrug: '¯\\_(ツ)_/¯',
        lenny: '( ͡° ͜ʖ ͡°)',
        tableflip: '(╯°□°）╯︵ ┻━┻',
        tableunflip: '┬─┬ノ( º _ ºノ)'
    }


};

class ElgaClass {
    constructor (config) {
        this.client = new Client();
        this.db = db;
        this.config = config;
        config.version = require(`${__dirname}/../package.json`).version;
        config.tags = Object.assign(config.tags || {}, prebuilts.tags);
        config.replaces = Object.assign(config.replaces || {}, prebuilts.replaces);
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
        require(`${__dirname}/cmd/reboot.js`).boot();
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
                const command = require(`./cmd/${file}`);
            //    this.log.info(`Loading Command: ${command.props.name}`);
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
        const command = msg.content.split(' ')[0].slice(this.config.prefix.length);
        let cmd;
        if (this.commands.has(command)) {
            cmd = this.commands.get(command);
        } else if (this.aliases.has(command)) {
            cmd = this.commands.get(this.aliases.get(command));
        }

        if (cmd) {
            const args = msg.content.split(' ').slice(1);
            try {
                cmd.run(msg, args, this);
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

new ElgaClass({
    prefix: '.',
    token: 'mfa.FjciRHIxxO6fFNd_A3zhbY6qu1dwyn-KPZPNYpDGYYS6gtBxKPiLRCzqri-DWs-aAx8W1TMnVAyc4OnCT2Gi',
    embedColor: parseInt('FF0000', '16'),
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
 *
*/
