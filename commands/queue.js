const { getVoiceConnection } = require('@discordjs/voice')
const { queue, queueEmbed } = require('../global/music')

module.exports = {
    name: 'queue',
    aliases: ['q'],
    description: 'Show the queue',
    async execute(message, args, cmd, client, Discord) {
        const playerVoiceChannel = getVoiceConnection(message.guild.id);
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) return message.channel.send('You need to be in a voice channel');
        if (!playerVoiceChannel) return message.channel.send('There is not a song playing now');
        if (voiceChannel != playerVoiceChannel.joinConfig.channelId) return message.channel.send('You need to be in the same voice channel');

        const songs = queue.get(message.guild.id).songs;

        let stringSongs = "";
        let count = 1;

        songs.forEach(song => {
            stringSongs += `${count}. **[${song.title}](${song.url})**\n`;
            count++;
        });

        await message.channel.send({ embeds: [queueEmbed("LIST", stringSongs)]})
    }
}