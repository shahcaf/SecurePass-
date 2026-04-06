const { EmbedBuilder } = require('discord.js');
const db = require('../utils/db');
const logger = require('../utils/logger');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const serverConfig = await db.getServer(message.guild.id);
    if (!serverConfig || !serverConfig.anti_link) return;

    // Only whitelisted users can post links — no exceptions, not even owners
    const whitelisted = await db.isWhitelisted(message.guild.id, message.author.id);
    if (whitelisted) return;

    const linkRegex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    if (linkRegex.test(message.content)) {
      try {
        await message.delete();

        const warnEmbed = new EmbedBuilder()
          .setTitle('🚨 Link Blocked')
          .setDescription(`${message.author}, links are not allowed unless you are whitelisted! Your message has been removed.`)
          .setColor('#ff4500')
          .setFooter({ text: 'SecurePass Anti-Link • Use /whitelist to manage permissions' });

        const warnMsg = await message.channel.send({ embeds: [warnEmbed] });
        setTimeout(() => warnMsg.delete().catch(() => {}), 5000);

        await db.addLog('ANTI_LINK_TRIGGERED', message.author.id, message.guild.id);
      } catch (error) {
        console.error('Error in anti-link:', error);
      }
    }
  }
};
