const snekfetch = require('snekfetch');

exports.run = async function (msg, args) {
    if (!args[0])
        return msg.edit('Missing required args.');
        
    if (args[0] === 'reset') {
        msg.edit('DB reset.');
        return client.redditdb = new Array();
    }

    if (args[0] === 'saved') {
        const res = await snekfetch.get('https://www.reddit.com/user/Dynamexia/saved.json?feed=f95fba458be1b5cec1736c39f226f1a25861f0ac&user=Dynamexia');

        msg.edit({ embed: {
            description: res.body.data.children
                .filter(child => child.data.title)
                .filter(child => child.data.url)
                .map(x => `[${x.data.title}](${x.data.url})`).join('\n')
        } });
    } else if (args[0] === 'frontpage') {
        const res = await snekfetch.get('https://www.reddit.com/.json?feed=f95fba458be1b5cec1736c39f226f1a25861f0ac&user=Dynamexia');
        const post = res.body.data.children
            .filter(child => child.data.selftext.length <= 2000)
            .filter(child => child.data.title.length <= 256)
            .filter(child => !client.redditdb.includes(child.data.id))[0];
        if (!post)
            return msg.edit(`No new posts found. Try specifying a time filter or clearing the 'Read posts' list with \`${settings.prefix}reddit reset\`.`);

        client.redditdb.push(post.data.id);

        let imageURL;
        if (post.data.preview)
            imageURL = post.data.preview.images[0].source.url;

        const description = `${post.data.url.includes('reddit.com') ? '' : post.data.url}${post.data.selftext}`;

        msg.edit({ embed: {
            author: { 
                name: `/u/${post.data.author} posted to /${post.data.subreddit_name_prefixed}`,
                url: `https://www.reddit.com/u/${post.data.author}`
            },
            color: settings.embedColor,
            title: post.data.title,
            url: post.data.url,
            description: description,
            image: { url: imageURL },
            footer: { text: `${post.data.score} upvotes | ${post.data.num_comments} comments`, icon_url: 'http://i.imgur.com/SpbPlMU.png' }
        } });
    } else {
        if (args[1] && !['hour', 'day', 'today', 'week', 'month', 'year', 'all'].includes(args[1]))
            return msg.edit(`Argument error! \`${args[1]}\` is not one of \`hour | day | week | month | year | all\`.`);

        const res = await snekfetch.get(`https://www.reddit.com/r/${args[0]}/top/.json?sort=top&t=${args[1] ? args[1] : 'all'}&limit=8`)
            .catch(err => {
                if (err)
                    return msg.edit(`Something went wrong. \n\`${err.message}\``);
            });
        if (!res.request.path.startsWith('/r/'))
            return msg.edit(`Subreddit \`${args[0]}\` not found.`);
        const post = res.body.data.children
            .filter(child => child.data.selftext.length <= 2000)
            .filter(child => child.data.title.length <= 256)
            .filter(child => !client.redditdb.includes(child.data.id))[0];
            if (!post)
                return msg.edit(`No new posts found. Try specifying a time filter or clearing the 'Read posts' list with \`${settings.prefix}reddit reset\`.`);

        client.redditdb.push(post.data.id);

        let imageURL;
        if (post.data.preview)
            imageURL = post.data.preview.images[0].source.url;

        const description = `${post.data.url.includes('reddit.com') ? '' : post.data.url}${post.data.selftext}`;
        msg.edit({ embed: {
            author: { 
                name: `Posted by /u/${post.data.author}`,
                url: `https://www.reddit.com/u/${post.data.author}`
            },
            color: settings.embedColor,
            title: post.data.title,
            url: post.data.url,
            description: description,
            image: { url: imageURL },
            footer: { text: `${post.data.score} upvotes | ${post.data.num_comments} comments` }
        } });
    }
};

exports.props = {
    name: 'reddit',
    usage: '{command} <subreddit name | frontpage> [hour | day | week | month | year | all]',
    aliases: ['rd'],
    description: 'Fetches posts from a specific subreddit. Defaults to all-time unless specified.'
};