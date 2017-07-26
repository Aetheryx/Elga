const meme = (str) => Array(str.length).fill(true).map((_, i) => !i || i === str.length - 1 ? !i ? str.split('').join(' ') : str.split('').reverse().join(' ') : str[i] + ' '.repeat(str.length * 2 - 3) + str[str.length - 1 - i]).join('\n');

exports.run = function (msg, args) {
    msg.edit(meme(args.join(' ')), { code: 'xl' });
};


exports.props = {
    name        : 'memebox',
    usage       : '{command} <text>',
    aliases     : ['mbx'],
    description : 'Makes a memebox out of text.'
};