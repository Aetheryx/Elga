exports.run = async function (Elga, msg, args) {
    if (!args[0]) {
        return Elga.missingArgsError(msg, this.props);
    }

    if (!['create', 'delete', 'remove', 'add', 'edit'].includes(args[0])) {
        const res = await Elga.db.get('SELECT * FROM tags WHERE tagName = ?', args[0]);
        if (!res) {
            return msg.edit(`No tag found with name ${args[0]}.`);
        } else {
            if (['jpg', 'png', 'peg', 'gif', 'ebp'].includes(res.tagContent.slice(-3, res.tagContent.length)) && (msg.channel.type === 'dm' || msg.channel.permissionsFor(Elga.user.id).has('EMBED_LINKS'))) {
                msg.edit({ embed: {                         // I would send this raw, but that would mean deleting the old message and sending a new one
                    color: Elga.config.embedColor,                                                 // because you can't edit old messages to have images
                    image: { url: res.tagContent }
                }});
            } else {
                msg.edit(res.tagContent);
            }
        }
    }

    const tagExists = await Elga.db.get('SELECT * FROM tags WHERE TagName = ?', args[1]);
    if (tagExists) {
        return msg.edit(`Tag \`${args[1]}\` already exists${tagExists.tagContent.length < 750 ? ` with contents:\`\`\`${tagExists.tagContent}\`\`\`` : '.'}`);
    }

    if (args[0] === 'create' || args[0] === 'add') {
        await Elga.db.run('INSERT INTO tags (TagNaasdasdme, TagCsdasd) VALUES (?, ?)', args[1], args.slice(2).join(' '))
            .catch(err => {
                this.log(err.stack);
                Elga.cmdErr(msg, err);
            });
    }
};

exports.props = {
    name        : 'tags',
    usage       : '{command} // TBD',
    aliases     : ['tag'],
    description : 'TBD'
};