const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure SecurePass settings for this server.')
    .addRoleOption(option => 
      option.setName('role').setDescription('The role to give when verified').setRequired(true))
    .addChannelOption(option => 
      option.setName('channel').setDescription('The channel for verification messages').setRequired(true))
    .addChannelOption(option => 
      option.setName('log_channel').setDescription('The channel for security logs').setRequired(true))
    .addBooleanOption(option => 
      option.setName('auto_verify').setDescription('Whether to auto-verify returning global users'))
    .addBooleanOption(option => 
      option.setName('anti_link').setDescription('Whether to block all links from non-admins'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Make the bot respond instantly and privately

    const role = interaction.options.getRole('role');
    const channel = interaction.options.getChannel('channel');
    const logChannel = interaction.options.getChannel('log_channel');
    const autoVerify = interaction.options.getBoolean('auto_verify') ?? true;
    const antiLink = interaction.options.getBoolean('anti_link') ?? false;

    try {
      // 1. Persist settings to Database
      await db.upsertServer(interaction.guildId, role.id, channel.id, logChannel.id, autoVerify, antiLink);

      // 2. Prepare Success Embed
      const embed = new EmbedBuilder()
        .setTitle('⚙️ Server Configuration Updated')
        .setDescription(`SecurePass is now configured for **${interaction.guild.name}**.`)
        .addFields(
          { name: 'Role', value: `<@&${role.id}>`, inline: true },
          { name: 'Verify Channel', value: `<#${channel.id}>`, inline: true },
          { name: 'Log Channel', value: `<#${logChannel.id}>`, inline: true },
          { name: 'Auto-Verify', value: autoVerify ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: 'Anti-Link', value: antiLink ? '✅ Enabled' : '❌ Disabled', inline: true }
        )
        .setColor('#3498db')
        .setFooter({ text: 'SecurePass • made by <@1414542711683289152>', iconURL: interaction.guild.iconURL() });

      await interaction.editReply({ embeds: [embed] });

      // 3. Deploy Verification Panel
      const panelEmbed = new EmbedBuilder()
        .setTitle('🛡️ SecurePass Verification')
        .setDescription(`To gain access to **${interaction.guild.name}**, you must complete our global identity verification. Once verified, you will be trusted across all servers using SecurePass!`)
        .setColor('#00ff7f')
        .setFooter({ text: 'SecurePass • made by <@1414542711683289152>' });

      const panelRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`verify_start_panel`)
          .setLabel('Verify Identity')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🛡️')
      );

      const targetChannel = await interaction.guild.channels.fetch(channel.id).catch(() => null);
      if (targetChannel && targetChannel.isTextBased()) {
        await targetChannel.send({ embeds: [panelEmbed], components: [panelRow] });
      } else {
        await interaction.followUp({ content: '⚠️ Configuration saved, but I could not find or access the verification channel. Check my permissions!', ephemeral: true });
      }
    } catch (error) {
      console.error('Setup Error:', error);
      if (interaction.deferred) {
        await interaction.editReply({ content: '❌ An error occurred during setup. Please check the bot logs.' });
      }
    }
  }
};
