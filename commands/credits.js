const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('credits')
    .setDescription('View the developers and contributors behind SecurePass.'),

  async execute(interaction) {
    await interaction.deferReply();
    const embed = new EmbedBuilder()
      .setTitle('✨ SecurePass Credits')
      .setDescription('SecurePass is a global verification bot designed to protect Discord communities through cross-server trust and automated identity security.')
      .addFields(
        { name: '🛠️ Lead Developer', value: '**<@1414542711683289152>** (Creator & Maintainer)', inline: true },
        { name: '🛡️ Core Concept', value: 'Global Verification Network', inline: true }
      )
      .setColor('#3498db')
      .setFooter({ text: 'SecurePass • made by <@1414542711683289152>', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.editReply({ embeds: [embed] });
  }
};
