module.exports = (_, Discord, client) => {
    console.log('The bot is online');
    client.user.setPresence({
        activities: [{ name: 'Pornhub'}, { name: 'Xvideos' }]
    })
}