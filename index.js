const { Client, GatewayIntentBits, Intents, Partials } = require('discord.js');
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
    partials: [Partials.Channel, Partials.Message]
});
var fs = require('fs');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    console.log('hi');
    if (msg.content === '!draft') {
        msg.reply('pong');
    }
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith("!draft")) {
        console.log('testing');
        message.reply("Test successful!");

        const draftFullCommand = message.content;
        const numberOfRounds = 
    }
});

try {
    var data = fs.readFileSync('config.json', 'utf8');
    const configFile = JSON.parse(data);
    client.login(configFile.TOKEN);
} catch(e) {
    console.log('Error:', e.stack);
}
