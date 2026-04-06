const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Show how long the bot has been online.'),

    async execute(interaction) {
        const uptimeMs = process.uptime() * 1000;
        const days    = Math.floor(uptimeMs / 86_400_000);
        const hours   = Math.floor((uptimeMs % 86_400_000) / 3_600_000);
        const minutes = Math.floor((uptimeMs % 3_600_000) / 60_000);
        const seconds = Math.floor((uptimeMs % 60_000) / 1000);

        const startTs = Math.floor((Date.now() - uptimeMs) / 1000);

        const embed = new EmbedBuilder()
            .setColor(Colors.Success)
            .setTitle('⏱️ Bot Uptime')
            .addFields(
                { name: '🕐 Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
                { name: '📅 Online Since', value: `<t:${startTs}:F>`, inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
