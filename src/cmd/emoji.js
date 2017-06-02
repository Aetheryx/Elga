exports.run = function (msg, args) {
    if (!args[0])
        return msg.edit('No arguments passed.');

    const specialCodes = {
        '0': ':zero: ',
        '1': ':one: ',
        '2': ':two: ',
        '3': ':three: ',
        '4': ':four: ',
        '5': ':five: ',
        '6': ':six: ',
        '7': ':seven: ',
        '8': ':eight: ',
        '9': ':nine: ',
        '#': ':hash: ',
        '*': ':asterisk: ',
        '?': ':grey_question: ',
        '!': ':grey_exclamation: '
    };
    
    const newContent = args.join(' ').toLowerCase().split('').map(letter => {
        if (/[a-z]/g.test(letter)) 
            return `:regional_indicator_${letter}: `;
        else if (specialCodes[letter])
            return specialCodes[letter];
        return letter;
    }).join('');

    msg.edit(newContent);
};

exports.props = {
    name        : 'emoji',
    usage       : '{command} <text to turn into emojis>',
    aliases     : ['emojify'],
    description : 'Turns text into emojis.'
};