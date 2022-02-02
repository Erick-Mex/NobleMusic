const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const {
    AudioPlayer,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    AudioPlayerStatus,
    getVoiceConnection
} = require('@discordjs/voice');

const queue = new Map();

module.exports = {
    name: 'play',
    aliases: ['p', 'skip', 'stop'],
    description: 'Plays audio from youtube',
    async execute(client, message, args, Discord, cmd) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) return message.channel.send('You need to be in a voice channel to use this command');

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send('You dont have the correct permissions');
        if (!permissions.has('SPEAK')) return message.channel.send('You dont have the correct permissions');

        const server_queue = queue.get(message.guild.id);

        if (cmd === 'play' || cmd === 'p') {
            if (!args.length) return message.channel.send('You need to send a second argument');
            let song = {}

            if (ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0]);
                song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
            } else {
                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }
                const video = await videoFinder(args.join(' '));
                if (video) {
                    song = { title: video.title, url: video.url }
                    /*
                    const stream = ytdl(video.url, {filter: 'audioonly'});
                    const connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator
                    });
                    const resource = createAudioResource(stream, {
                        inputType: StreamType.Arbitrary
                    });
        
                    const player = createAudioPlayer();
        
                    player.play(resource)
                    connection.subscribe(player);
                    
                    player.on(AudioPlayerStatus.Idle, () => connection.destroy());
        
                    message.channel.send(`Now playing ***${video.title}***`) */
                } else {
                    message.channel.send('No video results found');
                }
            }
            if (!server_queue) {
                const queue_constructor = {
                    voice_channel: voiceChannel,
                    text_channel: message.channel,
                    connection: null,
                    songs: []
                }

                queue.set(message.guild.id, queue_constructor);
                queue_constructor.songs.push(song);

                try {
                    const connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator
                    });
                    queue_constructor.connection = connection;
                    video_player(message.guild, queue_constructor.songs[0]);
                } catch (err) {
                    queue.delete(message.guild.id);
                    message.channel.send('There was an error conecting');
                    throw err;
                }
            } else {
                server_queue.songs.push(song);
                console.log(server_queue)
                //console.log(server_queue.songs)
                return message.channel.send(`***${song.title}*** added to the queue`);
            }
        }
        else if (cmd === 'skip') {
            skip_song(message, server_queue);
        }
        else if (cmd === 'stop') {
            //stop_song(message, server_queue);
            const playerVoiceChannel = getVoiceConnection(message.guild.id);
            if (!voiceChannel) return message.channel.send('You need to be in a voice channel');
            if (!playerVoiceChannel) return message.channel.send('There is not sonog playing now');
            if (voiceChannel != playerVoiceChannel.joinConfig.channelId) return message.channel.send('You need to be in the same voice channel');

            const player = playerVoiceChannel.state.subscription.player;
            server_queue.songs = [];
            player.stop();
            playerVoiceChannel.destroy();
        }
    }
}

const video_player = async (guild, song) => {
    const song_queue = queue.get(guild.id);

    if (!song) {
        song_queue.connection.destroy();
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, { filter: 'audioonly' });
    const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary
    });

    const player = createAudioPlayer();

    player.play(resource)
    song_queue.connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
        song_queue.songs.shift();
        video_player(guild, song_queue.songs[0]);
    })
    await song_queue.text_channel.send(`Now playing ***${song.title}***`)
}

const skip_song = (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command');
    if (!server_queue) return message.channel.send('There are no song in queue');

    server_queue.songs.shift()
}