const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('draft')
        .setDescription('Setup a fantasy snake draft!')
        .addIntegerOption(option =>
            option.setName('rounds')
                .setDescription('The number of rounds to have the draft go.')
                .setMinValue(1)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('userlist')
            .setDescription('Full list of users')),
    async execute(interaction) {
        const roundCount = interaction.options.getInteger('rounds');
        const userString = interaction.options.getString('userlist');
        const message = `Starting draft with ${roundCount} rounds and users: ${userString}`;
        console.log(message);
        await interaction.reply(message);
    },
};
