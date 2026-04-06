const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin — heads or tails.'),

    async execute(interaction) {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const emoji = result === 'Heads' ? '🪙' : '🟡';

        const embed = new EmbedBuilder()
            .setColor(Colors.Warning)
            .setTitle(`${emoji} Coin Flip!`)
            .setDescription(`The coin landed on **${result}**!`)
            .setFooter({ text: `Flipped by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
