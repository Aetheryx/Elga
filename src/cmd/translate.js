const translate = require('google-translate-api');
exports.run = async function(msg, args) {
    if (!args[0] || !args[1])
        return msg.edit('Missing required argument(s).')
     const obj = { to: args[0] };
     if (args[1].toLowerCase() !== 'auto')
        obj['from'] = args[1];
    const res = await translate(args.slice(2).join(' '), obj)
    msg.channel.send({ embed: {
        color: settings.embedColor,
        fields: [
            { name: `Input (${args[1].toLowerCase() === 'auto' ? res.from.language.iso : args[1]})`, value: args.slice(2).join(' ') },
            { name: `Output (${args[0]})`, value: res.text }
        ]
    } });
};

exports.props = {
    name        : 'translate',
    usage       : '{prefix}translate <target language> [source language] <text>',
    aliases     : ['ts'],
    description : 'Translates text from one language to the other. Will auto-detect if you don\'t specify a source language.'
};