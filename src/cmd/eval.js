exports.run = async function(msg, args) {
    let input = args.join(' ');
    const silent = input.includes('--silent') ? true : false;
    const asynchr = input.includes('--async') ? true : false;
    if (silent || asynchr)
        input = input.replace('--silent', '').replace('--async', '');

    let result;

    try {
        result = (asynchr ? eval(`(async()=>{${input}})();`) : eval(input));
        if (result instanceof Promise && asynchr) {
            result = await result;
        }
        if (typeof result !== 'string')
            result = require('util').inspect(result, { depth: 0 });
        result = result.replace(new RegExp(client.token, 'gi'), 'fite me irl');
    } catch (err) {
        result = err.message;
    }

    if (!silent)
        msg.edit(input + '\n```js\n' + result + '\n```');
    else
        msg.delete();
};

exports.props = {
    name        : 'eval',
    usage       : '{command} <script> [--async | --silent]',
    aliases     : ['e', 'ev', 'debug'],
    description : 'Evaluates scripts in Node.js.'
};