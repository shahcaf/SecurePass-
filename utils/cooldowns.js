const { Collection } = require('discord.js');
const { getDb } = require('../database/db');

// In-memory cooldown store: guildId -> commandName -> userId -> timestamp
const cooldownStore = new Collection();

/**
 * Check if a user is on cooldown for a command.
 * Returns remaining seconds if on cooldown, or 0 if ready.
 */
function checkCooldown(guildId, commandName, userId) {
    const db = getDb();
    const config = db.prepare('SELECT cooldown_seconds FROM guild_config WHERE guild_id = ?').get(guildId);
    const cooldownSeconds = config?.cooldown_seconds ?? 3;

    if (cooldownSeconds <= 0) return 0;

    const key = `${guildId}-${commandName}`;
    if (!cooldownStore.has(key)) {
        cooldownStore.set(key, new Collection());
    }

    const timestamps = cooldownStore.get(key);
    const now = Date.now();
    const cooldownMs = cooldownSeconds * 1000;

    if (timestamps.has(userId)) {
        const expiresAt = timestamps.get(userId) + cooldownMs;
        if (now < expiresAt) {
            return Math.ceil((expiresAt - now) / 1000);
        }
    }

    timestamps.set(userId, now);

    // Clean up old entries every 100 uses
    if (timestamps.size > 100) {
        timestamps.sweep((ts) => now - ts > cooldownMs);
    }

    return 0;
}

/**
 * Set the cooldown duration for a guild.
 */
function setCooldown(guildId, seconds) {
    const db = getDb();
    db.prepare(`
        INSERT INTO guild_config (guild_id, cooldown_seconds) VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET cooldown_seconds = ?
    `).run(guildId, seconds, seconds);
}

/**
 * Get the current cooldown for a guild.
 */
function getCooldown(guildId) {
    const db = getDb();
    const config = db.prepare('SELECT cooldown_seconds FROM guild_config WHERE guild_id = ?').get(guildId);
    return config?.cooldown_seconds ?? 3;
}

module.exports = { checkCooldown, setCooldown, getCooldown };
