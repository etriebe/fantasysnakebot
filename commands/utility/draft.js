const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const user = require('./user.js');
const draftsFilePath = './data/drafts.json';
const channelDraftFilePathFormat = './data/##CHANNELID##.json';
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
        const channelId = interaction.channelId;
        let existingChannelDraftData = getDraftDataFromFile(channelId);
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
            const originalDraftOrder = userList.join(", ");
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

            let newDraft = {
                rounds: roundCount,
                userString: userString,
                question: question,
                userQueue: fullUserQueue,
                answers: [],
                isFinished: false
            };

            if (existingChannelDraftData.length != 0)
            {
                message = `Deleting existing draft for this channel: Question: **'${existingChannelDraft[0].question}'**.\n\n`;
            }
            else
            {
                existingChannelDraftData = [];
            }

            existingChannelDraftData.unshift(newDraft);
            const firstUser = fullUserQueue[0];
            message += `Starting draft with ${roundCount} rounds. Question: ${question}. Draft order: ${originalDraftOrder}. First up: ${firstUser}`;
            saveDraftDataToFile(existingChannelDraftData, channelId);
            await interaction.reply(message);
            await interaction.reply(message);
        }
        else if (interaction.options.getSubcommand() === 'choose')
        {
            if (!existingChannelDraftData.length === 0)
            {
                await interaction.reply(`No drafts have been staretd in this channel. Please try the /draft /new command!`);
                return;
            }
            if (existingChannelDraftData[0].isFinished)
            {
                await interaction.reply(`Previous draft is already finished. Please start a new draft with the /draft /new command!`);
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
            existingChannelDraft.userQueue.shift();
            drafts[channelId] = existingChannelDraft;

            if (existingChannelDraft.userQueue.length === 0)
            {
                let message = `Draft finished! Result...`;
                for (let c of existingChannelDraft.answers)
                {
                    message += `\n* <@${c.user.userId}>: ${c.choice}`;
                }
                await interaction.reply(message);
            }
            else
            {
                const message = `Choice selected: ${choice}. Next up: <@${existingChannelDraft.userQueue[0].userId}>`;
                await interaction.reply(message);
            }

            saveDraftDataToFile(existingChannelDraftData, channelId);
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

function checkIfDraftActive()
{

}

function saveDraftDataToFile(data, channelId)
{
    fs.writeFileSync(getChannelDraftFile(channelId), JSON.stringify(data));
    return;
}

function getDraftDataFromFile(channelId)
{
    return JSON.parse(fs.readFileSync(getChannelDraftFile(channelId)));
}

function getChannelDraftFile(channelId)
{
    return channelDraftFilePathFormat.replace("##CHANNELID##", channelId);
}