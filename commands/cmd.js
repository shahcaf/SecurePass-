const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cmd')
    .setDescription('Display a categorized help menu for SecurePass.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ SecurePass Help Center')
      .setDescription('Please select a category from the dropdown menu below to view available commands and descriptions. SecurePass provides global verification and server-side link protection.')
      .addFields(
        { name: '👤 User', value: '`/status`, `/userinfo`, `/invite`, `/credits`, `/ping`', inline: true },
        { name: '⚙️ Admin', value: '`/setup`, `/config`, `/logs`, `/info`, `/antilink`', inline: true },
        { name: '🚨 Security', value: '`/blacklist`, `/unblacklist`, `/whitelist`', inline: true }
      )
      .setColor('#3498db')
      .setFooter({ text: 'SecurePass • maded by <@1414542711683289152>', iconURL: interaction.client.user.displayAvatarURL() });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('cmd_category_select')
      .setPlaceholder('Select a category...')
      .addOptions([
        { label: 'User Commands', description: 'Public identity/info tools', value: 'cat_user', emoji: '👤' },
        { label: 'Admin Commands', description: 'Server-side config/management', value: 'cat_admin', emoji: '⚙️' },
        { label: 'Security & Protection', description: 'Global security/enforcement', value: 'cat_security', emoji: '🚨' }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
