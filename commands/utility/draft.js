const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const user = require('./user.js');
const draftsFilePath = './data/drafts.json';
module.exports = {
    data: new SlashCommandBuilder()
        .setName('draft')
        .setDescription('Commands for creating and running a snake draft!')
        .addSubcommand(subcommand =>
            subcommand
                .setName("new")
                .setDescription("Create a new snake draft")
                .addIntegerOption(option =>
                    option.setName('rounds')
                        .setDescription('The number of rounds to have the draft go.')
                        .setMinValue(1)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('userlist')
                        .setDescription('Full list of users'))
                .addStringOption(option =>
                    option.setName('question')
                        .setDescription('Question to ask users')))
        .addSubcommand(subcommand =>
            subcommand
                .setName("choose")
                .setDescription("Make a choice in a draft")
                .addStringOption(option =>
                    option.setName('choice')
                        .setDescription('The choice being made with this selection'))),
    async execute(interaction)
    {
        let drafts = JSON.parse(fs.readFileSync(draftsFilePath));
        const channelId = interaction.channelId;
        const existingChannelDraft = drafts[channelId];
        if (interaction.options.getSubcommand() === 'new')
        {
            const roundCount = interaction.options.getInteger('rounds');
            const userString = interaction.options.getString('userlist');
            const userListSplit = userString.split(' ');
            const userList = [];
            const currentChannelMemberList = interaction.guild.channels.cache.get(channelId).members;
            for (let i = 0; i < userListSplit.length; i++)
            {
                let user = userListSplit[i]; // <@604015692492046336>
                user = user.replace('<', '').replace('>', '').replace('@', '');
                const userObject = currentChannelMemberList.get(user);
                if (userObject)
                {
                    userList.push(userObject);
                }
            }
            let fullUserQueue = [];
            shuffle(userList);
            for (let i = 0; i < roundCount; i++)
            {
                if (i != 0)
                {
                    userList.reverse();
                }
                fullUserQueue = fullUserQueue.concat(userList);
            }
            const question = interaction.options.getString('question');
            let message = ``;
            if (existingChannelDraft)
            {
                message = `Deleting existing draft for this channel: Question: **'${existingChannelDraft.question}'**.\n\n`;
            }
            drafts[channelId] = {
                rounds: roundCount,
                userString: userString,
                question: question,
                userQueue: fullUserQueue,
                answers: [],
                isFinished: false
            };
            message += `Starting draft with ${roundCount} rounds and users: ${userString}. Question: ${question}.`;
            console.log(`Round count: ${roundCount}, User List: ${userString}`);
            console.log(message);
            console.log(`Total drafts: ${drafts.length}`);
            fs.writeFileSync(draftsFilePath, JSON.stringify(drafts));
            await interaction.reply(message);
        }
        else if (interaction.options.getSubcommand() === 'choose')
        {
            if (!existingChannelDraft)
            {
                await interaction.reply(`No active draft in this channel.`);
                return;
            }
            const expectedUserToDraft = existingChannelDraft.userQueue[0];
            if (expectedUserToDraft.userId != interaction.member.id)
            {
                await interaction.reply(`It is not your turn. <@${expectedUserToDraft.userId}> is up.`);
                return;
            }
            const choice = interaction.options.getString('choice');
            if (existingChannelDraft.answers.find(a => a.choice.toLowerCase() === choice.toLowerCase()))
            {
                await interaction.reply(`Choice has already been made. Please choose again.`);
                return;
            }

            existingChannelDraft.answers.push({
                user: expectedUserToDraft,
                choice: choice
            });
            existingChannelDraft.userQueue = existingChannelDraft.userQueue.shift();
            drafts[channelId] = existingChannelDraft;
            fs.writeFileSync(draftsFilePath, JSON.stringify(drafts));
            await interaction.reply(message);
        }
    },
};

function shuffle(array)
{
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0)
    {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}