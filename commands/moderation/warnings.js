const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embeds');
const { getDb } = require('../../database/db');
const { Colors } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(o => o.setName('user').setDescription('The user to check.').setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const db = getDb();
        const warns = db.prepare('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC').all(interaction.guildId, target.id);

        if (warns.length === 0) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(Colors.Success).setDescription(`✅ **${target.tag}** has no warnings.`)] });
        }

        const warnList = warns.slice(0, 10).map((w, i) =>
            `**#${i + 1}** — <@${w.moderator_id}> • ${w.reason}\n${new Date(w.created_at).toLocaleDateString()}`
        ).join('\n\n');

        const embed = new EmbedBuilder()
            .setColor(Colors.Warning)
            .setTitle(`⚠️ Warnings for ${target.tag}`)
            .setDescription(warnList)
            .setFooter({ text: `Total: ${warns.length} warning(s)` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
