const { Client, Events, GatewayIntentBits, Intents, Partials } = require('discord.js');
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
    partials: [Partials.Channel, Partials.Message]
});
const { token } = require('./config.json');
var fs = require('fs');

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
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
        // const numberOfRounds = ;
    }
});

try {
    console.log()
    client.login(token);
} catch(e) {
    console.log('Error:', e.stack);
}
