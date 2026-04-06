const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { getDb } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setautorole')
        .setDescription('Set the role automatically assigned to new members.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(o => o.setName('role').setDescription('The role to assign (leave blank to disable).'))
        .addBooleanOption(o => o.setName('disable').setDescription('Set to true to disable the autorole.')),

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const disable = interaction.options.getBoolean('disable');
        const db = getDb();

        if (disable) {
            db.prepare(`
                INSERT INTO guild_config (guild_id, autorole_id) VALUES (?, NULL)
                ON CONFLICT(guild_id) DO UPDATE SET autorole_id = NULL
            `).run(interaction.guildId);
            return interaction.reply({ embeds: [successEmbed('Autorole has been **disabled**.')] });
        }

        if (!role) {
            return interaction.reply({ embeds: [errorEmbed('Please provide a role, or use `disable: true` to turn it off.')], ephemeral: true });
        }

        if (role.managed) {
            return interaction.reply({ embeds: [errorEmbed('Cannot use a bot-managed role as the autorole.')], ephemeral: true });
        }

        if (role.id === interaction.guildId) {
            return interaction.reply({ embeds: [errorEmbed('Cannot use @everyone as the autorole.')], ephemeral: true });
        }

        const botHighest = interaction.guild.members.me.roles.highest.position;
        if (role.position >= botHighest) {
            return interaction.reply({ embeds: [errorEmbed('That role is equal to or higher than my highest role.')], ephemeral: true });
        }

        db.prepare(`
            INSERT INTO guild_config (guild_id, autorole_id) VALUES (?, ?)
            ON CONFLICT(guild_id) DO UPDATE SET autorole_id = ?
        `).run(interaction.guildId, role.id, role.id);

        await interaction.reply({ embeds: [successEmbed(`New members will now receive the ${role} role.`)] });
    },
};
