const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { canModerate } = require('../../utils/permissions');
const { successEmbed, errorEmbed, modEmbed, sendLog } = require('../../utils/embeds');
const { getDb } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a member using the configured mute role.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(o => o.setName('user').setDescription('The user to mute.').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason for the mute.')),

    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) return interaction.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });

        const err = canModerate(interaction, target);
        if (err) return interaction.reply({ embeds: [errorEmbed(err)], ephemeral: true });

        const db = getDb();
        const config = db.prepare('SELECT mute_role_id FROM guild_config WHERE guild_id = ?').get(interaction.guildId);

        if (!config?.mute_role_id) {
            return interaction.reply({ embeds: [errorEmbed('No mute role configured. Use `/config` to set one, or use `/timeout` instead.')], ephemeral: true });
        }

        const muteRole = interaction.guild.roles.cache.get(config.mute_role_id);
        if (!muteRole) return interaction.reply({ embeds: [errorEmbed('Configured mute role not found. Please update `/config`.')], ephemeral: true });

        if (target.roles.cache.has(muteRole.id)) {
            return interaction.reply({ embeds: [errorEmbed('This user is already muted.')], ephemeral: true });
        }

        await target.roles.add(muteRole, reason);
        await interaction.reply({ embeds: [successEmbed(`**${target.user.tag}** has been muted.\n**Reason:** ${reason}`)] });
        await sendLog(interaction.guild, modEmbed('Mute', target.user, interaction.user, reason));
    },
};
