const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed, sendLog } = require('../../utils/embeds');
const { getDb } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a muted member.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(o => o.setName('user').setDescription('The user to unmute.').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason for unmuting.')),

    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) return interaction.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });

        const db = getDb();
        const config = db.prepare('SELECT mute_role_id FROM guild_config WHERE guild_id = ?').get(interaction.guildId);

        if (!config?.mute_role_id) {
            return interaction.reply({ embeds: [errorEmbed('No mute role configured.')], ephemeral: true });
        }

        const muteRole = interaction.guild.roles.cache.get(config.mute_role_id);
        if (!muteRole) return interaction.reply({ embeds: [errorEmbed('Configured mute role not found.')], ephemeral: true });

        if (!target.roles.cache.has(muteRole.id)) {
            return interaction.reply({ embeds: [errorEmbed('This user is not muted.')], ephemeral: true });
        }

        await target.roles.remove(muteRole, reason);
        await interaction.reply({ embeds: [successEmbed(`**${target.user.tag}** has been unmuted.`)] });
        await sendLog(interaction.guild, modEmbed('Unmute', target.user, interaction.user, reason));
    },
};
