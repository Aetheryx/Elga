exports.run = async function (msg, args) {
        let input = args.join(' ');
        const silent = input.includes('--silent') ? true : false;
        const asynchr = input.includes('--async') ? true : false;
        if (silent || asynchr) 
            input = input.replace('--silent', '').replace('--async', '');

        let result;
        let err;

        try {
            result = (asynchr ? eval(`(async()=>{${input}})();`) : eval(input));
            if (result instanceof Promise && asynchr) {
                result = await result;
                console.log('hiasdasd')
            }

            if (typeof result !== 'string')
                result = require('util').inspect(result, { depth: 0 });

            result = result.replace(new RegExp(client.token, 'gi'), 'fite me irl');
        } catch (err) {
            result = err.message;
            err = true;
        };

        if (!silent && !err) 
            msg.edit(input + '\n```js\n' + result + '\n```');
        else if (silent && !err) 
            msg.delete();
}

exports.props = {
    aliases     : ['e', 'ev', 'debug'],
    name        : 'eval',
    description : 'Evaluates scripts in Node.js. ',
    usage       : '{prefix}eval <script> [--async|--silent]'
};