const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('View detailed SecurePass security profile for a user.')
    .addUserOption(option => 
      option.setName('user').setDescription('The user to check status for').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    const target = interaction.options.getUser('user');
    const userStatus = await db.getUser(target.id);
    const blacklistedRes = await db.query('SELECT * FROM blacklist WHERE user_id = $1', [target.id]);
    const blacklist = blacklistedRes.rows[0];

    const embed = new EmbedBuilder()
      .setAuthor({ name: target.tag, iconURL: target.displayAvatarURL() })
      .setTitle('🛡️ Security Profile')
      .addFields(
        { name: '👤 Verified Status', value: userStatus?.verified ? '✅ Verified' : '❌ Not Verified', inline: true },
        { name: '📅 Verified Since', value: userStatus?.created_at ? userStatus.created_at.toLocaleString() : 'N/A', inline: true },
        { name: '🛠️ Method', value: userStatus?.method ? `\`${userStatus.method}\`` : 'N/A', inline: true },
        { name: '🛡️ Global Standings', value: blacklist ? '🚨 BLACKLISTED' : '✅ Good Standing', inline: true },
      )
      .setColor(userStatus?.verified && !blacklist ? '#00ff00' : '#ff0000')
      .setFooter({ text: 'SecurePass • made by <@1414542711683289152>' });

    if (blacklist) {
      embed.addFields({ name: '⚠️ Blacklist Reason', value: blacklist.reason || 'No reason provided.' });
    }

    await interaction.editReply({ embeds: [embed] });
  }
};
