const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Measure SecurePass response time and performance.'),

  async execute(interaction) {
    await interaction.deferReply();
    const lat = interaction.client.ws.ping;
    const embed = new EmbedBuilder()
      .setTitle('⚡ SecurePass Performance')
      .setDescription(`Current WebSocket latency: **${lat}ms**`)
      .setColor(lat < 100 ? '#00ff00' : (lat < 250 ? '#ffff00' : '#ff0000'))
      .setFooter({ text: 'Performance Monitoring • maded by <@1414542711683289152>' });

    await interaction.editReply({ embeds: [embed] });
  }
};
