/* eslint-disable */

exports.run = function (msg, args) {
    msg.edit('no');
};

exports.props = {
    name        : 'vaporwave',
    usage       : '{command} <text>',
    aliases     : ['aesthetics', 'vapor'],
    description : 'Generates ａｅｓｔｈｅｔｉｃ text.'
};

const charToFullWidth = char => {
    const c = char.charCodeAt(0)
    return c >= 33 && c <= 126
        ? String.fromCharCode(( c - 33 ) + 65281)
        : char
}

const stringToFullWidth = string => string.split('').map(charToFullWidth).join('')