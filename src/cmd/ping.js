exports.run = function (Elga, msg) {
    msg.edit({ embed: {
        color: Elga.config.embedColor,
        title: ':ping_pong: Pong!',
        description: `Websocket: ${Elga.client.ping.toFixed()}ms\nMessage round-trip: ${Date.now() - msg.createdTimestamp}ms`
    } });
};

exports.props = {
    name        : 'ping',
    usage       : '{command}',
    aliases     : [],
    description : 'Returns the latency to the Discord API server.'
};