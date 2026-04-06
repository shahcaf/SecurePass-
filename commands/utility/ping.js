const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency and API response time.'),

    async execute(interaction) {
        const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
        const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
        const ws = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor(ws < 100 ? Colors.Success : ws < 200 ? Colors.Warning : Colors.Error)
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '📡 Roundtrip', value: `${roundtrip}ms`, inline: true },
                { name: '💓 WebSocket', value: `${ws}ms`, inline: true },
            )
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    },
};
