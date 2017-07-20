/* eslint-disable no-console */
const chalk = require('chalk');
module.exports = class ElgaLogger {
    constructor () {}
    info (text) {
        console.log(chalk.green(`[${Date().toString().split(' ').slice(1, 5).join(' ')}] `) + text);
    }
    warn (text) {
        console.warn(chalk.yellow(`[${Date().toString().split(' ').slice(1, 5).join(' ')}] `) + text);
    }
    error (text) {
        console.error(chalk.red(`[${Date().toString().split(' ').slice(1, 5).join(' ')}] `) + text);
    }
};