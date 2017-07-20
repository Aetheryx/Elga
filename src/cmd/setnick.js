/* eslint-disable */
exports.run = async function (msg, args) {
    if (msg.channel.type === 'dm' || !msg.member.hasPermission('CHANGE_NICKNAME'))
        return msg.edit({ embed: {
            color: Elga.settings.embedColor,
            description: ':warning: You can\'t change your nickname here.'
        }});
    if (args.join(' ').length > 32)
        return msg.edit({ embed: {
            color: Elga.settings.embedColor,
            description: 'You can\'t set your nickname to something that long.'
        } });
    await msg.member.setNickname(args[0] || client.user.username);
    msg.edit({ embed: {
        color: Elga.settings.embedColor,
        description: `:ballot_box_with_check: Nickname set to \`${msg.member.displayName}\`.`
    }});
};

exports.props = {
    name        : 'setnick',
    usage       : '{command} <nickname (can be omitted to reset)>',
    aliases     : ['nick', 'nickname', 'setnickname'],
    description : 'Sets your nickname in the guild you\'re using it from. Omit argument to reset to username.'
};