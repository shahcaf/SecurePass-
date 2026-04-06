const { EmbedBuilder } = require('discord.js');

// ── Brand colors ───────────────────────────────────────────────────────
const Colors = {
    Primary: 0x5865F2,   // Blurple
    Success: 0x57F287,   // Green
    Warning: 0xFEE75C,   // Yellow
    Error: 0xED4245,     // Red
    Info: 0x5865F2,      // Blurple
    Moderation: 0xEB459E, // Fuchsia
};

/**
 * Create a standard success embed.
 */
function successEmbed(description) {
    return new EmbedBuilder()
        .setColor(Colors.Success)
        .setDescription(`✅ ${description}`)
        .setTimestamp();
}

/**
 * Create a standard error embed.
 */
function errorEmbed(description) {
    return new EmbedBuilder()
        .setColor(Colors.Error)
        .setDescription(`❌ ${description}`)
        .setTimestamp();
}

/**
 * Create a standard info embed.
 */
function infoEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(Colors.Info)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Create a moderation action embed.
 */
function modEmbed(action, user, moderator, reason) {
    return new EmbedBuilder()
        .setColor(Colors.Moderation)
        .setTitle(`🔨 ${action}`)
        .addFields(
            { name: 'User', value: `${user} (${user.id})`, inline: true },
            { name: 'Moderator', value: `${moderator}`, inline: true },
            { name: 'Reason', value: reason || 'No reason provided' }
        )
        .setTimestamp();
}

/**
 * Send a log to the guild's configured log channel.
 */
async function sendLog(guild, embed) {
    try {
        const { getDb } = require('../database/db');
        const db = getDb();
        const config = db.prepare('SELECT log_channel_id FROM guild_config WHERE guild_id = ?').get(guild.id);
        if (!config?.log_channel_id) return;

        const channel = await guild.channels.fetch(config.log_channel_id).catch(() => null);
        if (channel) await channel.send({ embeds: [embed] });
    } catch {
        // Silently fail if log channel is unavailable
    }
}

module.exports = { Colors, successEmbed, errorEmbed, infoEmbed, modEmbed, sendLog };
