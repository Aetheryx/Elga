const snekfetch = require('snekfetch');
const exec = require('child_process').exec;

exports.run = async function (msg, args) {
    if (!args[0])
        return msg.edit('No arguments sent.');

    msg.edit('```bash\n $ ' + args.join(' ') + '\n```'); // eslint-disable-line prefer-template

    exec(args.join(' '), async(e, stdout, stderr) => {
        if (stdout.length > 2000 || stderr.length > 2000) {
            const res = await snekfetch.post('https://hastebin.com/documents')
                .send(`${stdout}\n\n${stderr}`)
                .catch(err => msg.channel.send(err.message));

            msg.channel.send({ embed: {
                color: settings.embedColor,
                description: `Console log exceeds 2000 characters. View [here](https://hastebin.com/${res.body.key}).`
            } });
        } else {
            stdout && msg.channel.send('Info: \n\`\`\`' + stdout + '\`\`\`'); // eslint-disable-line prefer-template
            stderr && msg.channel.send('Errors: \n\`\`\`' + stderr + '\`\`\`'); // eslint-disable-line prefer-template
            if (!stderr && !stdout)
                msg.react('\u2611');
        }
    });
};

exports.props = {
    name        : 'exec',
    usage       : '{command} <command>',
    aliases     : ['bash', 'run'],
    description : 'Allows you to execute terminal commands.'
};