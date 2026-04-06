const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../utils/db');
const logger = require('../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Globally blacklist a user from all SecurePass servers.')
    .addUserOption(option => 
      option.setName('user').setDescription('The user to blacklist').setRequired(true))
    .addStringOption(option => 
      option.setName('reason').setDescription('The reason for global blacklisting').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // In a real global bot, this should be restricted to bot owners

  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    await db.blacklistUser(user.id, reason);
    await logger.log(interaction.guild, user, 'GLOBAL_BLACKLIST_ISSUED', '#ff0000');

    const embed = new EmbedBuilder()
      .setTitle('🚨 Global Blacklist Issued')
      .setDescription(`User **${user.tag}** has been globally blacklisted.`)
      .addFields(
        { name: '👤 User', value: `${user} (${user.id})`, inline: true },
        { name: '🛡️ Reason', value: reason, inline: true }
      )
      .setColor('#ff0000')
      .setFooter({ text: 'SecurePass • maded by <@1414542711683289152>', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.editReply({ embeds: [embed] });
  }
};
