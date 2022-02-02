module.exports = {
    name: 'ping',
    description: 'Just a ping command',
    execute(client, message, args, Discord, cmd) {
        message.channel.send(`my ping is ${Date.now() - message.createdTimestamp}ms`);
    }
}