const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check your global verification status.'),

  async execute(interaction) {
    await interaction.deferReply();
    const { user } = interaction;
    const userStatus = await db.getUser(user.id);
    const blacklisted = await db.isBlacklisted(user.id);

    const embed = new EmbedBuilder()
      .setTitle('🛡️ SecurePass Global Status')
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .addFields(
        { name: 'Verification', value: userStatus && userStatus.verified ? '✅ Verified' : '❌ Not Verified', inline: true },
        { name: 'Global Standing', value: blacklisted ? '🚨 Blacklisted' : '✅ Good Standing', inline: true },
      )
      .setColor(userStatus && userStatus.verified && !blacklisted ? '#00ff00' : '#ff0000')
      .setFooter({ text: 'SecurePass • maded by <@1414542711683289152>', iconURL: interaction.client.user.displayAvatarURL() });

    if (userStatus?.created_at) {
      embed.addFields({ name: '📅 Date Verified', value: userStatus.created_at.toLocaleString(), inline: true });
    }

    await interaction.editReply({ embeds: [embed] });
  }
};
