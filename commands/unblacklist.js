const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../utils/db');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unblacklist')
    .setDescription('Globally remove a user from the SecurePass blacklist.')
    .addUserOption(option => 
      option.setName('user').setDescription('The user to unblacklist').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user');

    const blacklisted = await db.isBlacklisted(user.id);
    if (!blacklisted) {
      return interaction.editReply({ content: '❌ This user is not globally blacklisted.' });
    }

    await db.removeBlacklist(user.id);
    await logger.log(interaction.guild, user, 'GLOBAL_BLACKLIST_REMOVED', '#00ff7f');

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Global Blacklist Removed')
      .setDescription(`User **${user.tag}** has been restored to good standing.`)
      .setColor('#00ff7f')
      .setFooter({ text: 'SecurePass • made by <@1414542711683289152>' });

    await interaction.editReply({ embeds: [embed] });
  }
};
