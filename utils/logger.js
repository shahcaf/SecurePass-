const { EmbedBuilder } = require('discord.js');
const db = require('./db');

module.exports = {
  log: async (guild, user, event, color = '#00bfff') => {
    const serverConfig = await db.getServer(guild.id);
    if (!serverConfig || !serverConfig.log_channel_id) return;

    const logChannel = await guild.channels.fetch(serverConfig.log_channel_id).catch(() => null);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('🛡️ SecurePass Log')
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .addFields(
        { name: 'Event', value: `\`${event}\``, inline: true },
        { name: 'User', value: `<@${user.id}> (${user.id})`, inline: true }
      )
      .setColor(color)
      .setTimestamp()
      .setFooter({ text: 'SecurePass • maded by <@1414542711683289152>' });

    await logChannel.send({ embeds: [embed] }).catch(console.error);
    
    // Also add to generic DB logs
    await db.addLog(event, user.id, guild.id);
  }
};
