const snekfetch = require('snekfetch');

exports.run = async function(msg, args) {
    if (!args[0])
        return msg.edit('Missing required args.');

    if (args[1] && !['hour', 'day', 'today', 'week', 'month', 'year', 'all'].includes(args[1]))
        return msg.edit(`Argument error! \`${args[1]}\` is not one of \`hour | day | week | month | year | all\`.`);

    const res = await snekfetch.get(`https://www.reddit.com/r/${args[0]}/top/.json?sort=top&t=${args[1] ? args[1] : 'all'}&limit=1`).set('X-Modhash', '5dvpp9pjvt0061a0909b8e0828df008a31d662a947ff0cd622');

    const children = res.body.data.children.filter((child) => child.data.selftext.length <= 2000);
    const data = children[Math.floor(Math.random() * children.length)].data;

    console.log(data);

    let imageURL;
    if (data.preview)
        imageURL = data.preview.images[0].source.url;

    msg.edit({ embed: {
        color: settings.embedColor,
        title: data.title,
        url: data.url,
        description: data.selftext,
        image: { url: imageURL },
        footer: { text: `${data.score} upvotes | ${data.num_comments} comments` }
    } })

};

exports.props = {
    name        : 'reddit',
    usage       : '{prefix}reddit <subreddit name> [hour | day | week | month | year | all]',
    aliases     : ['rd'],
    description : 'Fetches text posts from a specific subreddit. Defaults to all-time unless specified.'
};
