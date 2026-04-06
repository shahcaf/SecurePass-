const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get the invite link for SecurePass.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📥 Add SecurePass to Your Server')
      .setDescription('Secure your community with advanced verification, anti-bot protection, and automated role management.')
      .addFields(
        { name: '🚀 Quick Setup', value: 'Invite the bot, run `/setup`, and you\'re ready to go!', inline: false },
        { name: '🛡️ Enterprise Features', value: 'CAPTCHA, Alt Detection, Anti-Bot & more included for free.', inline: false }
      )
      .setColor('#00bfff')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: 'SecurePass • Professional Security for Discord' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Invite SecurePass')
          .setURL('https://discord.com/oauth2/authorize?client_id=1490543537505308892&permissions=8&integration_type=0&scope=bot')
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel('Visit Website')
          .setURL('https://shahcaf.github.io/SecurePass-add-me/')
          .setStyle(ButtonStyle.Link)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
