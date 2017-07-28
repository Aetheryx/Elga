exports.run = async function (Elga, msg, args) {
    if (!args[0]) {
        Elga.db.all('SELECT * FROM tags')
            .then(res => {
                msg.edit({ embed: {
                    title: `Tags (${res.length})`,
                    color: Elga.config.embedColor,
                    description: res.map(tag => tag.tagName).join(', ')
                } });
            })
            .catch(err => {
                Elga.cmdErr(msg, err);
            });
    }

    const tag = await Elga.db.get('SELECT * FROM tags WHERE TagName = ?', args[1] || args[0]);

    if (['create', 'edit'].includes(args[0]) && tag) {
        return msg.edit(`Tag \`${args[1]}\` already exists${tag.tagContent.length < 750 ? ` with contents:\n${Elga.codeblock(tag.tagContent)}` : '.'}`);
    }
    if (['delete', 'remove'].includes(args[0]) && !tag) {
        return msg.edit(`No tag found with name \`${args[0]}\`.`);
    }

    if (args[0] === 'remove' || args[0] === 'delete') {
        Elga.db.run('DELETE FROM tags WHERE TagName = ?', args[1])
            .then(() => {
                msg.edit(`Tag \`${args[1]}\` successfully deleted.`);
            })
            .catch(err => {
                return Elga.cmdErr(msg, err);
            });
    } else if (args[0] === 'create' || args[0] === 'add') {
        Elga.db.run('INSERT INTO tags (TagName, TagContent) VALUES (?, ?)', args[1], args.slice(2).join(' '))
            .then(() => {
                msg.channel.send({ embed: {
                    color: Elga.config.embedColor,
                    title: `${args[1]} created successfully.`,
                    description: `*${args.slice(2).join(' ')}*`
                } });
            })
            .catch(err => {
                return Elga.cmdErr(msg, err);
            });
    } else if (args[0] === 'edit') {
        Elga.db.run('UPDATE tags SET TagContent = ? WHERE TagName = ?', args.slice(2).join(' '), args[1])
            .then(() => {
                msg.channel.send({ embed: {
                    color: Elga.config.embedColor,
                    title: `${args[1]} updated successfully.`,
                    description: `*${args.slice(2).join(' ')}*`
                } });
            })
            .catch(err => {
                Elga.cmdErr(msg, err);
            });
    } else {
        if (['jpg', 'png', 'peg', 'gif', 'ebp'].includes(tag.tagContent.slice(-3, tag.tagContent.length)) && (msg.channel.type === 'dm' || msg.channel.permissionsFor(Elga.user.id).has('EMBED_LINKS'))) {
            msg.edit({ embed: {                  // I would send this raw, but that would mean deleting the old message and sending a new one
                color: Elga.config.embedColor,                                          // because you can't edit old messages to have images
                image: { url: tag.tagContent }
            } });
        } else {
            msg.edit(tag.tagContent);
        }
    }
};

exports.props = {
    name        : 'tags',
    usage       : '{command} [tag name | add | remove | edit | nothing] [tag name] [(new) contents]',
    aliases     : ['tag'],
    description : 'TBD'
};