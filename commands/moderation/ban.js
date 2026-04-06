const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { canModerate } = require('../../utils/permissions');
const { successEmbed, errorEmbed, modEmbed, sendLog } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(o => o.setName('user').setDescription('The user to ban.').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason for the ban.'))
        .addIntegerOption(o => o.setName('delete_days').setDescription('Days of messages to delete (0–7).').setMinValue(0).setMaxValue(7)),

    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteDays = interaction.options.getInteger('delete_days') ?? 0;

        if (!target) return interaction.reply({ embeds: [errorEmbed('User not found in this server.')], ephemeral: true });

        const err = canModerate(interaction, target);
        if (err) return interaction.reply({ embeds: [errorEmbed(err)], ephemeral: true });

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ embeds: [errorEmbed('I do not have permission to ban members.')], ephemeral: true });
        }

        await target.ban({ deleteMessageSeconds: deleteDays * 86400, reason });
        await interaction.reply({ embeds: [successEmbed(`**${target.user.tag}** has been banned.\n**Reason:** ${reason}`)] });
        await sendLog(interaction.guild, modEmbed('Ban', target.user, interaction.user, reason));
    },
};
