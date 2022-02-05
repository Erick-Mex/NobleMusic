module.exports = [
  {
    name: "help",
    description: "Show all the commands",
    format: "-help",
  },
  {
    name: "play",
    description: "Play a requested song",
    format: "-play <name | youtube url>",
  },
  {
    name: "lyrics",
    description: "Show the lyrics of the song",
    format: "-lyrics",
  },
  {
    name: "pause",
    description: "Pause the song",
    format: "-pause",
  },
  {
    name: "resume",
    description: "Resume the song",
    format: "-resume",
  },
  {
    name: "queue",
    description: "Show all songs in the queue",
    format: "-queue",
  },
  {
    name: "leave",
    description: "Disconnect the bot from the voice channel",
    format: "-leave",
  },
  {
    name: "ping",
    description: "Show the latency of the bot",
    format: "-ping",
  },
];
