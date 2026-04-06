const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('Display information about a role.')
        .addRoleOption(o => o.setName('role').setDescription('The role to look up.').setRequired(true)),

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const membersWithRole = interaction.guild.members.cache.filter(m => m.roles.cache.has(role.id)).size;

        const permissions = role.permissions.toArray()
            .map(p => `\`${p.replace(/_/g, ' ').toLowerCase()}\``)
            .slice(0, 12)
            .join(', ') || 'None';

        const embed = new EmbedBuilder()
            .setColor(role.color || Colors.Primary)
            .setTitle(`🔱 Role — ${role.name}`)
            .addFields(
                { name: '🆔 Role ID', value: role.id, inline: true },
                { name: '🎨 Color', value: role.hexColor, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:D>`, inline: true },
                { name: '👥 Members', value: `${membersWithRole}`, inline: true },
                { name: '📌 Position', value: `${role.position}`, inline: true },
                { name: '🤖 Managed', value: role.managed ? 'Yes (bot/integration)' : 'No', inline: true },
                { name: '🔑 Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
                { name: '💬 Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
                { name: '🔐 Permissions', value: permissions },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
