const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../utils/db');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antilink')
    .setDescription('Toggle the anti-link protection system for this server.')
    .addBooleanOption(option => 
      option.setName('enabled').setDescription('Whether to enable or disable anti-link').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply();
    const enabled = interaction.options.getBoolean('enabled');
    const guild = interaction.guild;

    const currentConfig = await db.getServer(guild.id);
    if (!currentConfig) {
      return interaction.editReply({ content: '❌ SecurePass is not setup yet. Use `/setup` first!' });
    }

    // Update only the anti_link status
    await db.upsertServer(
      guild.id, 
      currentConfig.role_id, 
      currentConfig.channel_id, 
      currentConfig.log_channel_id, 
      currentConfig.auto_verify, 
      enabled
    );

    const embed = new EmbedBuilder()
      .setTitle('🔗 Anti-Link Protection')
      .setDescription(`The anti-link system has been **${enabled ? 'Enabled' : 'Disabled'}**.`)
      .setColor(enabled ? '#00ff7f' : '#ff4500')
      .addFields({ name: 'Status', value: enabled ? '✅ Active (Blocking Links)' : '❌ Inactive' })
      .setFooter({ text: 'SecurePass • made by <@1414542711683289152>' });

    await interaction.editReply({ embeds: [embed] });
    await db.addLog(`ANTILINK_${enabled ? 'ENABLED' : 'DISABLED'}`, interaction.user.id, guild.id);
  }
};
