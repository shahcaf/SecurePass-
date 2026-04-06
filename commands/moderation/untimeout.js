const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed, sendLog } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove a timeout from a member.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(o => o.setName('user').setDescription('The user to untimeout.').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason for removing the timeout.')),

    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) return interaction.reply({ embeds: [errorEmbed('User not found in this server.')], ephemeral: true });
        if (!target.isCommunicationDisabled()) return interaction.reply({ embeds: [errorEmbed('This user is not currently timed out.')], ephemeral: true });

        await target.timeout(null, reason);
        await interaction.reply({ embeds: [successEmbed(`**${target.user.tag}**'s timeout has been removed.`)] });
        await sendLog(interaction.guild, modEmbed('Untimeout', target.user, interaction.user, reason));
    },
};
