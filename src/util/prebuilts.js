module.exports = {
    tags: {
        emojify: (undefined, str) => {
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
                '!': ':grey_exclamation: ',
                ' ': '   '
            };
            return str.toLowerCase().split('').map(letter => {
                if (/[a-z]/g.test(letter)) {
                    return `:regional_indicator_${letter}: `;
                } else if (specialCodes[letter]) {
                    return specialCodes[letter];
                } else {
                    return letter;
                }
            }).join('');
        },
        super: (undefined, str) => {
            const normals = ' 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            const supers = ' ⁰¹²³⁴⁵⁶⁷⁸⁹ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᑫʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᑫᴿˢᵀᵁⱽᵂˣʸᶻ'.split('');
            return str.split('').map(char => {
                if (normals.includes(char)) {
                    return supers[normals.indexOf(char)];
                } else {
                    return char;
                }
            }).join('');
        },
        upsidedown: (undefined, str) => {
            const normals = ' 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            const upsidedowns = ' 0ƖᄅƐㄣϛ9ㄥ86ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz∀qƆpƎℲפHIſʞ˥WNOԀQɹS┴∩ΛMX⅄Z'.split('');
            return str.split('').map(char => {
                if (normals.includes(char)) {
                    return upsidedowns[normals.indexOf(char)];
                } else {
                    return char;
                }
            }).join('');
        },
        flip: (undefined, str) => {
            return str.split('').reverse().join('');
        }
    },
    replaces: {
        shrug: '¯\\_(ツ)_/¯',
        lenny: '( ͡° ͜ʖ ͡°)',
        tableflip: '(╯°□°）╯︵ ┻━┻',
        tableunflip: '┬─┬ノ( º _ ºノ)'
    }
};