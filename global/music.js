const play = require('play-dl');
const { createAudioResource } = require('@discordjs/voice');

const queue = new Map();

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

const queueEmbed = (title, description) => {
    return {
        color: "ORANGE",
        title: title,
        description: description,        
    }
};

module.exports = {
    queue,
    musicEmbed,
    queueEmbed
};