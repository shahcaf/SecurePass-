const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set the slowmode delay for a channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addIntegerOption(o => o.setName('seconds').setDescription('Slowmode in seconds (0 = disable, max 21600).').setRequired(true).setMinValue(0).setMaxValue(21600)),

    async execute(interaction) {
        const seconds = interaction.options.getInteger('seconds');

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ embeds: [errorEmbed('I need the **Manage Channels** permission.')], ephemeral: true });
        }

        await interaction.channel.setRateLimitPerUser(seconds, `Slowmode set by ${interaction.user.tag}`);

        if (seconds === 0) {
            await interaction.reply({ embeds: [successEmbed('Slowmode has been **disabled** for this channel.')] });
        } else {
            const formatted = seconds >= 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${seconds}s`;
            await interaction.reply({ embeds: [successEmbed(`Slowmode set to **${formatted}** for this channel.`)] });
        }
    },
};
