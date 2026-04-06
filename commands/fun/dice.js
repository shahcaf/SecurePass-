const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll one or more dice.')
        .addIntegerOption(o => o.setName('sides').setDescription('Number of sides on each die (default: 6).').setMinValue(2).setMaxValue(100))
        .addIntegerOption(o => o.setName('count').setDescription('Number of dice to roll (default: 1, max: 10).').setMinValue(1).setMaxValue(10)),

    async execute(interaction) {
        const sides = interaction.options.getInteger('sides') ?? 6;
        const count = interaction.options.getInteger('count') ?? 1;

        const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
        const total = rolls.reduce((a, b) => a + b, 0);

        const embed = new EmbedBuilder()
            .setColor(Colors.Primary)
            .setTitle(`🎲 Dice Roll — ${count}d${sides}`)
            .addFields(
                { name: '🎲 Rolls', value: rolls.map(r => `\`${r}\``).join(' + '), inline: true },
                { name: '📊 Total', value: `**${total}**`, inline: true },
            )
            .setFooter({ text: `Rolled by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
