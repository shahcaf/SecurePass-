const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, Colors } = require('../../utils/embeds');
const { getDb } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('schedule')
        .setDescription('Schedule an event announcement.')
        .addSubcommand(s => s
            .setName('add')
            .setDescription('Schedule a new event.')
            .addStringOption(o => o.setName('title').setDescription('Event title.').setRequired(true))
            .addIntegerOption(o => o.setName('minutes').setDescription('Minutes from now (min 1).').setRequired(true).setMinValue(1).setMaxValue(525600))
            .addStringOption(o => o.setName('description').setDescription('Event description.')))
        .addSubcommand(s => s.setName('list').setDescription('List upcoming scheduled events.')),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const db = getDb();

        if (sub === 'add') {
            const title = interaction.options.getString('title');
            const minutes = interaction.options.getInteger('minutes');
            const description = interaction.options.getString('description') || '';
            const scheduledAt = Math.floor(Date.now() / 1000) + minutes * 60;

            db.prepare('INSERT INTO schedules (guild_id, channel_id, user_id, title, description, scheduled_at) VALUES (?, ?, ?, ?, ?, ?)')
                .run(interaction.guildId, interaction.channelId, interaction.user.id, title, description, scheduledAt);

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Success)
                    .setTitle('📅 Event Scheduled!')
                    .addFields(
                        { name: '📌 Title', value: title, inline: true },
                        { name: '⏰ Time', value: `<t:${scheduledAt}:F> (<t:${scheduledAt}:R>)`, inline: false },
                        ...(description ? [{ name: '📝 Description', value: description }] : []),
                    )
                    .setTimestamp()],
            });
        }

        if (sub === 'list') {
            const now = Math.floor(Date.now() / 1000);
            const events = db.prepare('SELECT * FROM schedules WHERE guild_id = ? AND scheduled_at > ? ORDER BY scheduled_at ASC LIMIT 10').all(interaction.guildId, now);

            if (events.length === 0) {
                return interaction.reply({ embeds: [errorEmbed('No upcoming events scheduled.')], ephemeral: true });
            }

            const list = events.map((e, i) =>
                `**${i + 1}. ${e.title}**\n<t:${e.scheduled_at}:F> (<t:${e.scheduled_at}:R>)${e.description ? `\n${e.description}` : ''}`
            ).join('\n\n');

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Primary)
                    .setTitle('📅 Upcoming Events')
                    .setDescription(list)
                    .setTimestamp()],
            });
        }
    },
};
