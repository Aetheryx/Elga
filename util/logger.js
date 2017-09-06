/* eslint-disable no-console */
const chalk = require('chalk');
const types = {
    warn: 'warn',
    error: 'error',
    info: 'log'
}
module.exports = function (str, type, returnString) {
    if (type === 'warn') {
        str = chalk.yellow(`[${Date().toString().split(' ').slice(1, 5).join(' ')}, WARN] `) + str;
    }

    if (type === 'error') {
        str = chalk.red(`[${Date().toString().split(' ').slice(1, 5).join(' ')}, ERROR] `) + str;
    }

    if (!type || type === 'info') {
        str = chalk.green(`[${Date().toString().split(' ').slice(1, 5).join(' ')}, INFO] `) + str;
    }

    if (returnString) {
        return str;
    } else {
        console[types[type || 'info']](str);
    }
};