const Discord = require('discord.js');
const fs = require('fs');

require('dotenv').config();

let client = new Discord.Client({
    fetchAllMembers: true,
    presence: {
        status: 'online',
        activity: {
            name: 'Pornhub',
            type: 'PLAYING'
        }
    },
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES", "GUILD_MESSAGE_REACTIONS"]
});

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler','event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
});

client.login(process.env.TOKEN);