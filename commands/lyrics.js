require("dotenv").config();

const { getVoiceConnection } = require("@discordjs/voice");
const { getLyrics, getSong } = require("genius-lyrics-api");

module.exports = {
  name: "lyrics",
  aliases: ["ly"],
  description: "display the lyrics of the current song",
  async execute(message, args, cmd, client, Discord) {
    const playerVoiceChannel = getVoiceConnection(message.guild.id);

    if (!playerVoiceChannel)
      return message.channel.send(
        "The bot is not connected to a voice channel"
      );

    try {
      const playerInfo =
        playerVoiceChannel.state.subscription.player.state.resource.metadata
          .title;
      const songInfo = playerInfo.split(" - ");
      try {
        const playerInfo =
          playerVoiceChannel.state.subscription.player.state.resource.metadata
            .title;
  
        const songInfo = playerInfo.split(" - ");
  
        const pattern = " x ";
        songInfo[0] = songInfo[0].replace(pattern, " & ");
        const options = {
          apiKey: process.env.GENIUS,
          title: songInfo[1].split("(")[0],
          artist: songInfo[0],
          optimizeQuery: true,
        };
        const lyrics = await getLyrics(options);
        const song = await getSong(options);
  
        //Object of the embed message
        const lyricEmbed = {
          color: "YELLOW",
          author: "Lyrics",
          title: song.title,
          description: lyrics + `\n\n[LINK](${song.url})`,
          thumbnail: {
            url: song.albumArt,
          },
        };
  
        //Send the embed message to the channel
        message.channel.send({ embeds: [lyricEmbed] });
      } catch (err) {
        message.channel.send("Sorry, no lyrics :cry:");
      }
    } catch (err) {
      message.channel.send("Wait for the bot to connect");
    }
    const pattern = " x ";
  }
};
