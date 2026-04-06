const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed, sendLog } = require('../../utils/embeds');
const { getDb } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(o => o.setName('user').setDescription('The user to warn.').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason for the warning.').setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason');

        if (!target) return interaction.reply({ embeds: [errorEmbed('User not found in this server.')], ephemeral: true });
        if (target.id === interaction.user.id) return interaction.reply({ embeds: [errorEmbed('You cannot warn yourself.')], ephemeral: true });

        const db = getDb();
        db.prepare('INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)')
            .run(interaction.guildId, target.id, interaction.user.id, reason);

        const warnCount = db.prepare('SELECT COUNT(*) as count FROM warnings WHERE guild_id = ? AND user_id = ?')
            .get(interaction.guildId, target.id).count;

        await interaction.reply({
            embeds: [successEmbed(`**${target.user.tag}** has been warned. (**${warnCount}** total warning${warnCount !== 1 ? 's' : ''})\n**Reason:** ${reason}`)],
        });

        // DM the user
        await target.user.send(`⚠️ You have been warned in **${interaction.guild.name}**.\n**Reason:** ${reason}\nYou now have **${warnCount}** warning(s).`).catch(() => {});
        await sendLog(interaction.guild, modEmbed('Warn', target.user, interaction.user, reason));
    },
};
