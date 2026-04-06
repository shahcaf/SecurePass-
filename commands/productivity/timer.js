const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timer')
        .setDescription('Start a countdown timer (displayed as Discord timestamp).')
        .addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes.').setRequired(true).setMinValue(1).setMaxValue(1440)),

    async execute(interaction) {
        const minutes = interaction.options.getInteger('minutes');
        const endsAt = Math.floor(Date.now() / 1000) + minutes * 60;

        const display = minutes >= 60
            ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
            : `${minutes}m`;

        const embed = new EmbedBuilder()
            .setColor(Colors.Warning)
            .setTitle('⏱️ Timer Started!')
            .setDescription(`Timer set for **${display}**\nEnds: <t:${endsAt}:F> (<t:${endsAt}:R>)`)
            .setFooter({ text: `Started by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
