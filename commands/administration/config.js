const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, Colors } = require('../../utils/embeds');
const { getDb } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('View or update bot configuration for this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(s => s.setName('view').setDescription('View current configuration.'))
        .addSubcommand(s => s
            .setName('muterole')
            .setDescription('Set the mute role.')
            .addRoleOption(o => o.setName('role').setDescription('The mute role.').setRequired(true))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const db = getDb();

        if (sub === 'view') {
            const config = db.prepare('SELECT * FROM guild_config WHERE guild_id = ?').get(interaction.guildId);

            const logChannel = config?.log_channel_id ? `<#${config.log_channel_id}>` : 'Not set';
            const autorole = config?.autorole_id ? `<@&${config.autorole_id}>` : 'Not set';
            const muteRole = config?.mute_role_id ? `<@&${config.mute_role_id}>` : 'Not set';
            const cooldown = config?.cooldown_seconds ?? 3;

            const embed = new EmbedBuilder()
                .setColor(Colors.Primary)
                .setTitle(`⚙️ Server Configuration — ${interaction.guild.name}`)
                .addFields(
                    { name: '📋 Log Channel', value: logChannel, inline: true },
                    { name: '🎭 Auto-Role', value: autorole, inline: true },
                    { name: '🔇 Mute Role', value: muteRole, inline: true },
                    { name: '⏱️ Cooldown', value: `${cooldown}s`, inline: true },
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (sub === 'muterole') {
            const role = interaction.options.getRole('role');

            if (role.managed) return interaction.reply({ embeds: [errorEmbed('Cannot use a bot-managed role.')], ephemeral: true });

            db.prepare(`
                INSERT INTO guild_config (guild_id, mute_role_id) VALUES (?, ?)
                ON CONFLICT(guild_id) DO UPDATE SET mute_role_id = ?
            `).run(interaction.guildId, role.id, role.id);

            return interaction.reply({ embeds: [successEmbed(`Mute role set to ${role}.`)] });
        }
    },
};
