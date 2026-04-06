const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { canModerate } = require('../../utils/permissions');
const { successEmbed, errorEmbed, modEmbed, sendLog } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout (mute) a member for a duration.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(o => o.setName('user').setDescription('The user to timeout.').setRequired(true))
        .addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes (1–40320).').setRequired(true).setMinValue(1).setMaxValue(40320))
        .addStringOption(o => o.setName('reason').setDescription('Reason for the timeout.')),

    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const minutes = interaction.options.getInteger('minutes');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) return interaction.reply({ embeds: [errorEmbed('User not found in this server.')], ephemeral: true });

        const err = canModerate(interaction, target);
        if (err) return interaction.reply({ embeds: [errorEmbed(err)], ephemeral: true });

        await target.timeout(minutes * 60 * 1000, reason);

        const duration = minutes >= 60
            ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
            : `${minutes}m`;

        await interaction.reply({ embeds: [successEmbed(`**${target.user.tag}** has been timed out for **${duration}**.\n**Reason:** ${reason}`)] });
        await sendLog(interaction.guild, modEmbed(`Timeout (${duration})`, target.user, interaction.user, reason));
    },
};
