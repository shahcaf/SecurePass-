const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, Colors } = require('../../utils/embeds');
const { getDb } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reminders')
        .setDescription('View or clear your active reminders.')
        .addSubcommand(s => s.setName('list').setDescription('List your active reminders.'))
        .addSubcommand(s => s
            .setName('delete')
            .setDescription('Delete a reminder by ID.')
            .addIntegerOption(o => o.setName('id').setDescription('The reminder ID to delete.').setRequired(true))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const db = getDb();

        if (sub === 'list') {
            const reminders = db.prepare('SELECT * FROM reminders WHERE user_id = ? ORDER BY remind_at ASC').all(interaction.user.id);
            if (reminders.length === 0) {
                return interaction.reply({ embeds: [errorEmbed('You have no active reminders.')], ephemeral: true });
            }

            const list = reminders.map((r, i) =>
                `**#${r.id}** — <t:${r.remind_at}:R>\n📝 ${r.message}`
            ).join('\n\n');

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Primary)
                    .setTitle('⏰ Your Reminders')
                    .setDescription(list)
                    .setFooter({ text: `${reminders.length}/10 reminders active` })
                    .setTimestamp()],
                ephemeral: true,
            });
        }

        if (sub === 'delete') {
            const id = interaction.options.getInteger('id');
            const reminder = db.prepare('SELECT * FROM reminders WHERE id = ? AND user_id = ?').get(id, interaction.user.id);
            if (!reminder) {
                return interaction.reply({ embeds: [errorEmbed(`No reminder found with ID #${id}.`)], ephemeral: true });
            }
            db.prepare('DELETE FROM reminders WHERE id = ?').run(id);
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(Colors.Success).setDescription(`✅ Reminder #${id} deleted.`).setTimestamp()],
                ephemeral: true,
            });
        }
    },
};
