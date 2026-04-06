const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { canModerate } = require('../../utils/permissions');
const { successEmbed, errorEmbed, modEmbed, sendLog } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(o => o.setName('user').setDescription('The user to kick.').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason for the kick.')),

    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) return interaction.reply({ embeds: [errorEmbed('User not found in this server.')], ephemeral: true });

        const err = canModerate(interaction, target);
        if (err) return interaction.reply({ embeds: [errorEmbed(err)], ephemeral: true });

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ embeds: [errorEmbed('I do not have permission to kick members.')], ephemeral: true });
        }

        await target.kick(reason);
        await interaction.reply({ embeds: [successEmbed(`**${target.user.tag}** has been kicked.\n**Reason:** ${reason}`)] });
        await sendLog(interaction.guild, modEmbed('Kick', target.user, interaction.user, reason));
    },
};
