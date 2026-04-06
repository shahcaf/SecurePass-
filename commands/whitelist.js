const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Manage the anti-link whitelist for this server.')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Allow a user to post links.')
        .addUserOption(opt => opt.setName('user').setDescription('User to whitelist').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Revoke a user\'s link permissions.')
        .addUserOption(opt => opt.setName('user').setDescription('User to remove').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('View all whitelisted users in this server.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const target = interaction.options.getUser('user');
      await db.addWhitelist(interaction.guildId, target.id);

      const embed = new EmbedBuilder()
        .setTitle('✅ User Whitelisted')
        .setDescription(`${target} can now post links in this server.`)
        .setColor('#00ff7f')
        .setFooter({ text: 'SecurePass Anti-Link • maded by <@1414542711683289152>' });

      await interaction.editReply({ embeds: [embed] });

    } else if (sub === 'remove') {
      const target = interaction.options.getUser('user');
      await db.removeWhitelist(interaction.guildId, target.id);

      const embed = new EmbedBuilder()
        .setTitle('🚫 User Removed from Whitelist')
        .setDescription(`${target} can no longer post links in this server.`)
        .setColor('#ff4500')
        .setFooter({ text: 'SecurePass Anti-Link • maded by <@1414542711683289152>' });

      await interaction.editReply({ embeds: [embed] });

    } else if (sub === 'list') {
      const users = await db.getWhitelist(interaction.guildId);
      const list = users.length > 0
        ? users.map(id => `<@${id}>`).join('\n')
        : 'No users are whitelisted.';

      const embed = new EmbedBuilder()
        .setTitle('📋 Anti-Link Whitelist')
        .setDescription(list)
        .setColor('#3498db')
        .setFooter({ text: `${users.length} user(s) whitelisted • SecurePass` });

      await interaction.editReply({ embeds: [embed] });
    }
  }
};
