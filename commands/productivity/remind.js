const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, Colors } = require('../../utils/embeds');
const { getDb } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Set a reminder.')
        .addStringOption(o => o.setName('message').setDescription('What to remind you about.').setRequired(true))
        .addIntegerOption(o => o.setName('minutes').setDescription('Minutes from now (min 1).').setRequired(true).setMinValue(1).setMaxValue(525600)),

    async execute(interaction) {
        const message = interaction.options.getString('message');
        const minutes = interaction.options.getInteger('minutes');
        const remindAt = Math.floor(Date.now() / 1000) + minutes * 60;

        const db = getDb();
        const existing = db.prepare('SELECT COUNT(*) as count FROM reminders WHERE user_id = ?').get(interaction.user.id);
        if (existing.count >= 10) {
            return interaction.reply({ embeds: [errorEmbed('You already have 10 reminders. Use `/reminders` to manage them.')], ephemeral: true });
        }

        db.prepare('INSERT INTO reminders (user_id, channel_id, guild_id, message, remind_at) VALUES (?, ?, ?, ?, ?)')
            .run(interaction.user.id, interaction.channelId, interaction.guildId, message, remindAt);

        const display = minutes >= 60
            ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
            : `${minutes}m`;

        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(Colors.Success)
                .setTitle('⏰ Reminder Set!')
                .setDescription(`I'll remind you in **${display}** (<t:${remindAt}:R>)\n\n📝 **${message}**`)
                .setTimestamp()],
            ephemeral: true,
        });
    },
};
