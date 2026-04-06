const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('View recent verification logs for this server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const res = await db.query('SELECT * FROM logs WHERE server_id = $1 ORDER BY created_at DESC LIMIT 10', [interaction.guildId]);
    const logs = res.rows;

    const embed = new EmbedBuilder()
      .setTitle('📋 Recent Security Logs')
      .setDescription(`Viewing the last 10 events for **${interaction.guild.name}**.`)
      .setColor('#00bfff')
      .setFooter({ text: 'SecurePass • made by <@1414542711683289152>', iconURL: interaction.guild.iconURL() });

    if (logs.length === 0) {
      embed.setDescription('No logs found for this server.');
    } else {
      const logsText = logs.map(l => `**[${l.created_at.toLocaleString()}]** ${l.event} - <@${l.user_id}>`).join('\n');
      embed.setDescription(logsText);
    }

    await interaction.reply({ embeds: [embed] });
  }
};
