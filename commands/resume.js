const {getVoiceConnection, AudioPlayerStatus} = require('@discordjs/voice')

module.exports = {
    name: 'resume',
    description: 'resume the song',
    async execute(client, message, args, Discord, cmd) {
        const playerVoiceChannel = getVoiceConnection(message.guild.id);
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) return message.channel.send('You need to be in a voice channel');

        if(!playerVoiceChannel) return message.channel.send('There is not a song playing now')
        if(voiceChannel != playerVoiceChannel.joinConfig.channelId) return message.channel.send('You need to be on the same voice channel');

        const player = playerVoiceChannel.state.subscription.player;
        player.unpause();

        //TODO: Add a reaction instead of sending a message
        message.channel.send('resuming the song');
    }
}