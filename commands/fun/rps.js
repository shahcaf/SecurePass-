const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

const choices = ['🪨 Rock', '📄 Paper', '✂️ Scissors'];
const outcomes = {
    '🪨 Rock':     { beats: '✂️ Scissors', loses: '📄 Paper' },
    '📄 Paper':    { beats: '🪨 Rock',     loses: '✂️ Scissors' },
    '✂️ Scissors': { beats: '📄 Paper',    loses: '🪨 Rock' },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock, Paper, Scissors against the bot.')
        .addStringOption(o => o
            .setName('choice')
            .setDescription('Your choice.')
            .setRequired(true)
            .addChoices(
                { name: '🪨 Rock', value: '🪨 Rock' },
                { name: '📄 Paper', value: '📄 Paper' },
                { name: '✂️ Scissors', value: '✂️ Scissors' },
            )),

    async execute(interaction) {
        const userChoice = interaction.options.getString('choice');
        const botChoice = choices[Math.floor(Math.random() * 3)];

        let result, color;
        if (userChoice === botChoice) {
            result = "It's a **tie**! 🤝";
            color = Colors.Warning;
        } else if (outcomes[userChoice].beats === botChoice) {
            result = 'You **win**! 🎉';
            color = Colors.Success;
        } else {
            result = 'You **lose**! 😔';
            color = Colors.Error;
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('✊ Rock, Paper, Scissors!')
            .addFields(
                { name: '👤 Your Choice', value: userChoice, inline: true },
                { name: '🤖 Bot Choice', value: botChoice, inline: true },
                { name: '🏆 Result', value: result },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
