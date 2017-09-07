/* eslint-disable no-console */
const chalk = new (require('chalk')).constructor({
    enabled: true
});
const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const types = {
    warn: 'yellow',
    error: 'red',
    info: 'green'
};
require('draftlog').into(console);
class Logger {
    constructor () {
        this.drafts = new Map();
        this.chalk = chalk;
    }

    async printStats (Elga) {
        this.log('Stats:');
        let index = 0;
        const draft = console.draft('Loading stats...');
        const spinner = setInterval(() => {
            index++;
            draft(`${frames[index % frames.length]} Loading stats...`);
        }, 50);
        await this.sleep(3500);
        clearInterval(spinner);
        let stats = {
            Guilds: Elga.guilds.size,
            Users: Elga.users.size,
            Channels: Elga.channels.size,
            Friends: Elga.user.friends.size
        };
        stats = Object.keys(stats).map(key => {
            return `${key}: ${this.chalk.green(stats[key])}`;
        }).join('\n');
        const length = Math.max.apply(null, stats.split('\n').map(line => line.length));
        draft(`${chalk.dim('*'.repeat(length))}\n${stats}\n${chalk.dim('*'.repeat(length))}`);
        console.log('\n\n\n\n');
    }

    sleep (ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    log (message, type, returnString) {
        const log = chalk[types[type] || 'green'](`[${Date().toString().split(' ').slice(1, 5).join(' ')}, ${type ? type.toUpperCase() : 'INFO'}] `) + message;
        if (returnString) {
            return log;
        } else {
            console.log(log);
        }
    }

    async draft (name, type, string, succeed) {
        if (!process.stderr.isTTY) {
            return this.log(string);
        }
        switch (type) {
        case 'create': {
            this.drafts.set(name, {
                spinning: true,
                string,
                draft: console.draft(this.log(`${frames[0]} ${string}`, 'info', true))
            });
            let index = 0;
            while (this.drafts.get(name).spinning) {
                await this.sleep(50);
                this.drafts.get(name).draft(this.log(`${frames[index % frames.length]} ${string}`, 'info', true));
                index++;
            }
            break;
        }
        case 'end':
            this.drafts.get(name).spinning = false;
            await this.sleep(50);
            this.drafts.get(name).draft(this.log(`${succeed ? '✔' : '✖'} ${string}`, 'info', true));
            this.drafts.delete(name);
            break;
        }
    }
}

module.exports = new Logger();
