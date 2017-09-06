/* eslint-disable no-console */
const chalk = new(require('chalk')).constructor({
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
        this.drafts = new Array();
        this.chalk = chalk;
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

    async draft (name, type, string) {
        if (!process.stderr.isTTY) {
            return this.log(string);
        }
        switch (type) {
        case 'create': {
            this.drafts.push({ spinning: true, name, string, draft: console.draft(this.log(`${frames[0]} ${string}`, 'info', true)) });
            let index = 0;
            while (this.drafts.find(draft => draft.name === name).spinning) {
                await this.sleep(50);
                this.drafts.find(draft => draft.name === name).draft(this.log(`${frames[index % frames.length]} ${string}`, 'info', true));
                index++;
            }
            break;
        }
        case 'end':
            this.drafts.find(draft => draft.name === name).spinning = false;
            await this.sleep(50);
            this.drafts.find(draft => draft.name === name).draft(this.log(`✔ ${string}`, 'info', true));
            delete this.drafts.find(draft => draft.name === name);
            break;
        }
    }
}

module.exports = new Logger();