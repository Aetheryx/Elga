exports.run = function(msg) {
    msg.edit({ embed: {
            color: settings.embedColor,
            title: ':ping_pong: Pong!',
            description: `Websocket: ${client.ping.toFixed()}ms\nMessage round-trip: ${Date.now() - msg.createdTimestamp}ms`
        } });
};



exports.props = {
    aliases: [],
    name: 'ping',
    description: 'Returns the latency to the Discord API server.',
    usage: '{prefix}ping'
};