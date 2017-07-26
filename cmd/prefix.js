const fs = require('fs');
exports.run = function (Elga, msg, args) {
    Elga.config.prefix = args.join(' ');
    if (typeof Elga.config.src !== 'string') {
        msg.edit(`Prefix set to \`${Elga.config.prefix}\`.\nNote: changes only remain for this instance because the config was provided as an object, and not as a path to a JSON config.`);
    } else {
        msg.edit(`Prefix set to \`${Elga.config.prefix}\`.`);
        const settings = {
            token: Elga.config.token,
            prefix: Elga.config.prefix,
            playingStatus: Elga.config.playingStatus,
            autoReload: Elga.config.autoReload,
            embedColor: Elga.config.embedColor
        };
        fs.writeFileSync(Elga.config.src, JSON.stringify(settings, '', '\t'));
    }
};

exports.props = {
    name        : 'prefix',
    usage       : '{command} <new prefix>',
    aliases     : [],
    description : 'Changes Elga\'s prefix.'
};