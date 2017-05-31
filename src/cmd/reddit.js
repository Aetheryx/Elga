const snekfetch = require('snekfetch');

exports.run = async function(msg, args) {
    if (!args[0])
        return msg.edit('Missing required args.');

    if (args[1] && !['hour', 'day', 'today', 'week', 'month', 'year', 'all'].includes(args[1]))
        return msg.edit(`Argument error! \`${args[1]}\` is not one of \`hour | day | week | month | year | all\`.`);

    const res = await snekfetch.get(`https://www.reddit.com/r/${args[0]}/top/.json?sort=top&t=${args[1] ? args[1] : 'all'}&limit=5`)

    const post = res.body.data.children.filter((child) => child.data.selftext.length <= 2000 && !client.redditDB.includes(child.data.id))[0];
    
    if (!post)
        return msg.edit('No new posts found!');

    client.redditDB.push(post.data.id);

    let imageURL;

    if (post.preview)
        imageURL = post.preview.images[0].source.url;

    msg.edit({ embed: {
        color: settings.embedColor,
        title: post.data.title,
        url: post.data.url,
        description: post.data.selftext,
        image: { url: imageURL },
        footer: { text: `${post.data.score} upvotes | ${post.data.num_comments} comments` }
    } })

};

exports.props = {
    name        : 'reddit',
    usage       : '{prefix}reddit <subreddit name> [hour | day | week | month | year | all]',
    aliases     : ['rd'],
    description : 'Fetches text posts from a specific subreddit. Defaults to all-time unless specified.'
};
