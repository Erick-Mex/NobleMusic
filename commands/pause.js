const {getVoiceConnection, AudioPlayerStatus} = require('@discordjs/voice')

module.exports = {
    name: 'pause',
    description: 'Pause the song',
    async execute(message, args, cmd, client, Discord) {
        const playerVoiceChannel = getVoiceConnection(message.guild.id);
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) return message.channel.send('You need to be in a voice channel');

        if(!playerVoiceChannel) return message.channel.send('The bot is not connected to a voice channel')
        if(voiceChannel != playerVoiceChannel.joinConfig.channelId) return message.channel.send('You need to be on the same voice channel');

        const player = playerVoiceChannel.state.subscription.player;
        
        player.pause();

        message.react('⏯');
    }
}