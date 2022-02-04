const play = require('play-dl');
const { createAudioResource } = require('@discordjs/voice');

const queue = new Map();

const addSong = async (guildId, song) => {
    const server_queue = queue.get(guildId);

    if (!server_queue) {
        const queue_const = { loop: false, songs: [] };
        queue.set(guildId, queue_const);
        queue_const.songs.push(song);
    } else {
        server_queue.songs.push(song);
    }
};

const loopQueue = (guildId) => {
    const server_queue = queue.get(guildId);
    if (!server_queue) return 'SN';
    server_queue.loop = !server_queue.loop;
    return server_queue.loop;
};

const fullQueue = (guildId) => {
    const server_queue = queue.get(guildId);
    if (!server_queue) return 'Empty queue';

    const songs = [];
    server_queue.songs.foreach((song) => {
        songs.push(`**${song.title}** - **[Link](${song.url})**\n`);
    });
    return songs;
};

const deleteSong = (title, guildId) => {
    const server_queue = queue.get(guildId);
    if (!server_queue) return 'Empty queue';

    const songTitle = (song) => song.title.includes(title);
    const songIndex = server_queue.songs.findIndex(songTitle);
    const songFullTitle = server_queue.songs.find(songTitle);

    if (!songIndex || songIndex == -1)
        return { msg: 'The song was not found', title: title };

    server_queue.songs.splice(songIndex, 1);
    return { msg: 'Song deleted', title: songFullTitle.title };
};

const musicEmbed = (title, duration, uploader, thumbnail, url, requestAuthor) => {
    return {
        color: "PURPLE",
        title: "***Now playing***",
        description: `\`\`\`css\n${title}\`\`\`\n`,
        fields: [
            {
                name: 'Duration',
                value: duration,
                inline: true,
            },
            {
                name: 'Requested by',
                value: requestAuthor,
                inline: true,
            },
            {
                name: 'Uploader',
                value: uploader,
                inline: true,
                
            },
            {
                name: 'URL',
                value: `[Click](${url})`,
                inline: true,

            }
        ],
        thumbnail: {
            url: thumbnail
        }
    }
}

module.exports = {
    queue,
    musicEmbed
};