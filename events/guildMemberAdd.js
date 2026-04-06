const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../utils/db');
const logger = require('../utils/logger');


module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const { guild, user } = member;

    // 1. Check Blacklist
    const blacklisted = await db.isBlacklisted(user.id);
    if (blacklisted) {
      member.kick('Global Blacklisted User').catch(() => {});
      return;
    }

    // 2. Get Server Config
    const serverConfig = await db.getServer(guild.id);
    if (!serverConfig) return;

    // 3. Check Verification Status
    const userStatus = await db.getUser(user.id);

    if (userStatus && userStatus.verified) {
      if (serverConfig.auto_verify && serverConfig.role_id) {
        try {
          await member.roles.add(serverConfig.role_id);
          await logger.log(guild, user, 'AUTO_VERIFIED', '#00ff00');
        } catch (error) {
          console.error(`Failed to assign role to ${user.tag} in ${guild.name}:`, error);
        }
      }
    } else {
      // Prompt Verification
      const channel = guild.channels.cache.get(serverConfig.channel_id);
      if (channel) {
        const embed = new EmbedBuilder()
          .setTitle('🛡️ SecurePass Verification')
          .setDescription(`Welcome to **${guild.name}**, ${user}! To access this server, you must verify your identity through our global security platform.`)
          .setColor('#00bfff')
          .setFooter({ text: 'SecurePass • maded by <@1414542711683289152>', iconURL: guild.iconURL() })
          .setTimestamp();

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`verify_start_${user.id}`)
              .setLabel('Verify Now')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('🛡️')
          );

        channel.send({ content: `${user}`, embeds: [embed], components: [row] }).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 300000); // Delete after 5 mins
        });
      }
    }
  }
};
