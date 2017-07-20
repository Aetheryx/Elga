const util = require('util');

exports.run = async function (msg, args) {
    let input = args.join(' ');
    const silent = input.includes('--silent');
    const asynchr = input.includes('--async');
    if (silent || asynchr) {
        input = input.replace('--silent', '').replace('--async', '');
    }

    let result;

    try {
        result = asynchr ? eval(`(async()=>{return ${input}})();`) : eval(input);
        if (result instanceof Promise && asynchr) {
            result = await result;
        }
        if (typeof result !== 'string') {
            result = util.inspect(result, { depth: 0 });
        }
        const tokenRegex = new RegExp(Elga.client.token, 'gi');
        result = result.replace(tokenRegex, '[TOKEN]');
    } catch (err) {
        result = err.message;
    }

    if (!silent) {
        msg.edit(`${input}\n\`\`\`js\n${result}\n\`\`\``);
    } else {
        msg.delete();
    }
};

exports.props = {
    name        : 'eval',
    usage       : '{command} <script> [--async | --silent]',
    aliases     : ['e', 'ev', 'debug'],
    description : 'Evaluates scripts in Node.js.'
};