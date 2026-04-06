const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('permissions')
        .setDescription('Check what permissions a member or role has.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(o => o.setName('user').setDescription('Check a member\'s permissions.'))
        .addRoleOption(o => o.setName('role').setDescription('Check a role\'s permissions.')),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');

        if (!user && !role) {
            return interaction.reply({ content: '❌ Please specify a user or role.', ephemeral: true });
        }

        let perms, title;

        if (user) {
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            if (!member) return interaction.reply({ content: '❌ Member not found.', ephemeral: true });
            perms = member.permissions;
            title = `🔐 Permissions — ${user.tag}`;
        } else {
            perms = role.permissions;
            title = `🔐 Permissions — @${role.name}`;
        }

        if (perms.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Warning)
                    .setTitle(title)
                    .setDescription('⚠️ Has **Administrator** — all permissions granted.')
                    .setTimestamp()],
            });
        }

        const permArray = perms.toArray();
        const formatted = permArray.map(p => `✅ \`${p.replace(/_/g, ' ')}\``).join('\n') || 'No significant permissions.';

        const embed = new EmbedBuilder()
            .setColor(Colors.Primary)
            .setTitle(title)
            .setDescription(formatted.slice(0, 4096))
            .setFooter({ text: `${permArray.length} permission(s)` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
