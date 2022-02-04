const {getVoiceConnection, AudioPlayerStatus} = require('@discordjs/voice')

module.exports = {
    name: 'pause',
    description: 'Pause the song',
    async execute(message, args, cmd, client, Discord) {
        const playerVoiceChannel = getVoiceConnection(message.guild.id);
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) return message.channel.send('You need to be in a voice channel');

        if(!playerVoiceChannel) return message.channel.send('There is not a song playing now')
        if(voiceChannel != playerVoiceChannel.joinConfig.channelId) return message.channel.send('You need to be on the same voice channel');

        const player = playerVoiceChannel.state.subscription.player;
        
        player.pause();

        player.on(AudioPlayerStatus.Paused, () => {
            playerVoiceChannel.destroy();
        });

        //TODO: Add a reaction instead of sending a message
        message.channel.send('is Pause');
    }
}