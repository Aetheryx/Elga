/* eslint-disable */
//const translate = require('google-translate-api');

exports.run = async function (Elga, msg, args) {
    if (!args[2])
        return msg.edit('Missing required arguments.');
    const res = await translate(args.slice(2).join(' '), { from: args[0], to: args[1] });
    msg.channel.send({ embed: {
        color: Elga.config.embedColor,
        fields: [
            { name: `Input (${args[0].toLowerCase() === 'auto' ? res.from.language.iso : args[0]})`, value: args.slice(2).join(' ') },
            { name: `Output (${args[1]})`, value: res.text }
        ]
    } });
};

exports.props = {
    name        : 'translate',
    usage       : '{command} <source language | auto> <target language> <text>',
    aliases     : ['ts'],
    description : 'Translates text from one language to the other. Will auto detect source language if you specify `auto` as the source language.'
};