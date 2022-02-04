const ytdl = require('ytdl-core');
const play = require('play-dl'); //Best version of the yt
let timeout;

const { queue, musicEmbed } = require('../global/music');

const {
    AudioPlayer,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    AudioPlayerStatus,
    getVoiceConnection
} = require('@discordjs/voice');

//const queue = new Map();

module.exports = {
    name: 'play',
    aliases: ['p', 'skip', 'stop'],
    description: 'play a [song/url video]',
    async execute(message, args, cmd, client, Discord) {
        const voice_channel = message.member.voice.channel;
        if (!voice_channel) return message.channel.send('You need to be in a channel to execute this command!');
        const permissions = voice_channel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send('You dont have the correct permissins');
        if (!permissions.has('SPEAK')) return message.channel.send('You dont have the correct permissins');

        const server_queue = queue.get(message.guild.id);

        if (cmd === 'play' || cmd === 'p') {
            if (!args.length) return message.channel.send('You need to send a song or url video');
            let song = {};


            //ytdl.validateURL(args[0])
            if (ytdl.validateURL(args[0])) {
                const song_info = await play.video_basic_info(args[0]);
                song = {
                    title: song_info.video_details.title,
                    duration: song_info.video_details.durationRaw,
                    uploader: song_info.video_details.channel.name,
                    thumbnail: song_info.video_details.thumbnails[0].url,
                    url: song_info.video_details.url,
                    requestAuthor: message.member.displayName || message.author.username,
                }
            } else {
                const video = await play.search(args.join(' '));
                if (video[0]) {
                    song = {
                        title: video[0].title,
                        duration: video[0].durationRaw,
                        uploader: video[0].channel.name,
                        thumbnail: video[0].thumbnails[0].url,
                        url: video[0].url,
                        requestAuthor: message.member.displayName || message.author.username,
                    }
                } else {
                    message.channel.send('Error finding video.');
                }
            }

            if (!server_queue) {

                const queue_constructor = {
                    voice_channel: voice_channel,
                    text_channel: message.channel,
                    connection: null,
                    songs: []
                }

                queue.set(message.guild.id, queue_constructor);
                queue_constructor.songs.push(song);

                try {
                    const connection = joinVoiceChannel({
                        channelId: voice_channel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator
                    });
                    queue_constructor.connection = connection;
                    video_player(message.guild, queue_constructor.songs[0]);
                } catch (err) {
                    queue.delete(message.guild.id);
                    message.channel.send('There was an error connecting!');
                    throw err;
                }
            } else {
                server_queue.songs.push(song);
                //console.log('The queue');
                //console.log(queue.get(message.guild.id).songs);
                return message.channel.send(`👍 **${song.title}** added to queue!`);
            }
        }

        else if (cmd === 'skip') skip_song(message, server_queue);
        else if (cmd === 'stop') stop_song(message, server_queue);
    }

}

/**
 * @brief Play a song of the queue
 * 
 * @param guild Server of the channel ?
 * @param song Current song of the queue
 * @returns
 */
const video_player = async (guild, song) => {
    //If a new song is playing, stop the timeout
    clearTimeout(timeout);

    const song_queue = queue.get(guild.id);
    if (!song) {
        //Wait two minutes and then destroy the connection
        timeout = setTimeout(() => {
            song_queue.connection.destroy();
            song_queue.text_channel.send('Nothing to do here, bye!!');
        }, 2 * 60 * 1000);
        queue.delete(guild.id);
        return;
    }

    //Create and play the song
    const stream = await play.stream(song.url);
    const resource = createAudioResource(stream.stream, {
        inputType: stream.type
    });
    const player = createAudioPlayer();
    player.play(resource);
    song_queue.connection.subscribe(player);

    //If the bot stop playing the current song, then play the next one
    player.on(AudioPlayerStatus.Idle, async () => {
        song_queue.songs.shift();
        video_player(guild, song_queue.songs[0]);
    });
    await song_queue.text_channel.send({embeds: [musicEmbed(song.title, song.duration, song.uploader, song.thumbnail, song.url, song.requestAuthor)]})
}

/**
 * @brief Skip the current song of the queue
 * 
 * @param message The interaction provided for the user
 * @param server_queue Queue of the songs
 * @returns 
 */
const skip_song = (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    if (!server_queue) {
        return message.channel.send(`There are no songs in queue 😔`);
    }
    server_queue.songs.shift();
    if (server_queue.songs.length < 1) stop_song(message, server_queue);

    video_player(message.guild, server_queue.songs[0]);
}

/**
 * 
 * @param message The interaction provided for the user 
 * @param server_queue Queue of the songs
 * @returns 
 */
const stop_song = (message, server_queue) => {
    const playerVoiceChannel = getVoiceConnection(message.guild.id);
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send('You need to be in a voice channel');
    if (!playerVoiceChannel) return message.channel.send('No music is playing now');
    if (voiceChannel != playerVoiceChannel.joinConfig.channelId) return message.channel.send('you need to be in the same voice channel');

    const player = playerVoiceChannel.state.subscription.player;

    server_queue.songs = [];

    player.stop();
    player.on(AudioPlayerStatus.Idle, async () => {
        playerVoiceChannel.destroy();
        return message.channel.send('Nothing to do here, bye!!');
    });
}