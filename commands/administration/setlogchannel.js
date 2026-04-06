const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { getDb } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogchannel')
        .setDescription('Set the channel where moderation logs are posted.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(o => o.setName('channel').setDescription('The log channel.').setRequired(true)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        if (channel.type !== 0) {
            return interaction.reply({ embeds: [errorEmbed('Please select a **text** channel.')], ephemeral: true });
        }

        const db = getDb();
        db.prepare(`
            INSERT INTO guild_config (guild_id, log_channel_id) VALUES (?, ?)
            ON CONFLICT(guild_id) DO UPDATE SET log_channel_id = ?
        `).run(interaction.guildId, channel.id, channel.id);

        await interaction.reply({ embeds: [successEmbed(`Moderation logs will now be sent to ${channel}.`)] });
    },
};
