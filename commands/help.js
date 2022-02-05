const allCommands = require('../allCommands');

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'Show all the commands',
    async execute(message, args, cmd, client, Discord) {
        let stringCommands = "";
        allCommands.map(command => {
            stringCommands += `**${command.name}** :: ${command.description} \`\`\`${command.format}\`\`\`\n`;
        });

        const embedMessage = {
            color: "GREEN",
            title: 'HELP MENU',
            description: stringCommands,
            footer: {
                text: `Requested by: ${message.member.displayName || message.author.username}`,
                icon_url: message.author.displayAvatarURL()
            },
            thumbnail: {
                url: client.user.displayAvatarURL()
            }
        }

        message.channel.send({ embeds: [embedMessage] });
    }
}