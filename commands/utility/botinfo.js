const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');
const { version: djsVersion } = require('discord.js');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Display information about the bot.'),

    async execute(interaction) {
        const client = interaction.client;
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
        const memTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);

        const embed = new EmbedBuilder()
            .setColor(Colors.Primary)
            .setTitle(`🤖 ${client.user.username}`)
            .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: '🆔 Bot ID', value: client.user.id, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:D>`, inline: true },
                { name: '⏱️ Uptime', value: uptimeStr, inline: true },
                { name: '🖥️ Servers', value: `${client.guilds.cache.size}`, inline: true },
                { name: '👥 Users', value: `${client.users.cache.size}`, inline: true },
                { name: '⚡ Commands', value: `${client.commands.size}`, inline: true },
                { name: '💓 Ping', value: `${client.ws.ping}ms`, inline: true },
                { name: '💾 Memory', value: `${memUsed} MB used`, inline: true },
                { name: '📦 discord.js', value: `v${djsVersion}`, inline: true },
                { name: '🟢 Node.js', value: process.version, inline: true },
            )
            .setFooter({ text: 'Utility Bot • Production Ready' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
