const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Display global statistics for SecurePass.'),

  async execute(interaction) {
    const userRes = await db.query('SELECT COUNT(*) FROM users WHERE verified = TRUE');
    const blacklistRes = await db.query('SELECT COUNT(*) FROM blacklist');
    const logRes = await db.query('SELECT COUNT(*) FROM logs');

    const embed = new EmbedBuilder()
      .setTitle('🛡️ SecurePass Global Statistics')
      .addFields(
        { name: '👥 Total Verified Users', value: `\`${userRes.rows[0].count}\``, inline: true },
        { name: '🚨 Total Blacklisted', value: `\`${blacklistRes.rows[0].count}\``, inline: true },
        { name: '📜 Total Security Events', value: `\`${logRes.rows[0].count}\``, inline: true },
        { name: '🌐 Total Servers', value: `\`${interaction.client.guilds.cache.size}\``, inline: true },
        { name: '⚡ Bot Latency', value: `\`${Math.round(interaction.client.ws.ping)}ms\``, inline: true }
      )
      .setColor('#00bfff')
      .setFooter({ text: 'SecurePass • made by <@1414542711683289152>', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed] });
  }
};
