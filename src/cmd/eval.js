exports.run = async function (msg, args) {
        let script = args.join(' ');
        let silent = script.includes('--silent') ? true : false;
        let asynchr = script.includes('--async') ? true : false;
        if (silent || asynchr) 
            script = script.replace('--silent', '').replace('--async', '');

        try {
            let code = (asynchr ? eval(`(async()=>{${script}})();`) : eval(script));
            if (code instanceof Promise && asynchr) code = await code;
            if (typeof code !== 'string')
                code = require('util').inspect(code, { depth: 0 });
            code = code.replace(new RegExp(client.token, 'gi'), 'fite me irl');
            if (!silent) msg.edit(script + '\n```xl\n' + code + '\n```');
        } catch (e) {
            msg.edit(script + '\n`ERROR` ```xl\n' + e + '\n```');
        };
}

exports.props = {
    aliases     : ['e', 'ev', 'debug'],
    name        : 'eval',
    description : 'Evaluates scripts in Node.js.',
    usage       : '{prefix}eval <script> [--async|--silent]'
};