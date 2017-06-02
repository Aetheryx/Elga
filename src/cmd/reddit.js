const snekfetch = require('snekfetch');

exports.run = async function (msg, args) {
    if (!args[0])
        return msg.edit('Missing required args.');

    if (args[0] === 'reset')
        return client.redditDB = new Array();

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
        .filter(child => !client.redditDB.includes(child.data.id))[0];

    if (!post)
        return msg.edit('No new posts found!');

    client.redditDB.push(post.data.id);

    let imageURL;

    if (post.data.preview)
        imageURL = post.data.preview.images[0].source.url;

    msg.edit({
        embed: {
            color: settings.embedColor,
            title: post.data.title,
            url: post.data.url,
            description: post.data.selftext,
            image: { url: imageURL },
            footer: { text: `${post.data.score} upvotes | ${post.data.num_comments} comments` }
        }
    });
};

exports.props = {
    name: 'reddit',
    usage: '{command} <subreddit name> [hour | day | week | month | year | all]',
    aliases: ['rd'],
    description: 'Fetches posts from a specific subreddit. Defaults to all-time unless specified.'
};