const { PermissionFlagsBits } = require('discord.js');

/**
 * Check if a member has the required permission.
 */
function hasPermission(member, permission) {
    return member.permissions.has(permission);
}

/**
 * Check if the bot can perform a moderation action on a target.
 * Returns an error message string, or null if OK.
 */
function canModerate(interaction, target) {
    const botMember = interaction.guild.members.me;

    // Can't moderate yourself
    if (target.id === interaction.user.id) {
        return 'You cannot perform this action on yourself.';
    }

    // Can't moderate the bot
    if (target.id === botMember.id) {
        return 'I cannot perform this action on myself.';
    }

    // Can't moderate the server owner
    if (target.id === interaction.guild.ownerId) {
        return 'You cannot perform this action on the server owner.';
    }

    // Role hierarchy check (user)
    if (interaction.member.roles.highest.position <= target.roles?.highest?.position) {
        return 'You cannot moderate a member with an equal or higher role than yours.';
    }

    // Role hierarchy check (bot)
    if (botMember.roles.highest.position <= target.roles?.highest?.position) {
        return 'I cannot moderate a member with an equal or higher role than mine.';
    }

    return null;
}

/**
 * Check if the user is the bot owner.
 */
function isOwner(userId) {
    return userId === process.env.OWNER_ID;
}

module.exports = { hasPermission, canModerate, isOwner, PermissionFlagsBits };
