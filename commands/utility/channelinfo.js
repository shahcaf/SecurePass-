const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { Colors } = require('../../utils/embeds');

const channelTypeNames = {
    [ChannelType.GuildText]: '💬 Text',
    [ChannelType.GuildVoice]: '🔊 Voice',
    [ChannelType.GuildCategory]: '📂 Category',
    [ChannelType.GuildAnnouncement]: '📢 Announcement',
    [ChannelType.GuildStageVoice]: '🎤 Stage',
    [ChannelType.GuildForum]: '🗂️ Forum',
    [ChannelType.GuildThread]: '🧵 Thread',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channelinfo')
        .setDescription('Display information about a channel.')
        .addChannelOption(o => o.setName('channel').setDescription('The channel to look up (defaults to current).')),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const typeName = channelTypeNames[channel.type] || 'Unknown';

        const embed = new EmbedBuilder()
            .setColor(Colors.Primary)
            .setTitle(`${typeName} — #${channel.name}`)
            .addFields(
                { name: '🆔 Channel ID', value: channel.id, inline: true },
                { name: '📁 Type', value: typeName, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:D>`, inline: true },
            )
            .setTimestamp();

        if (channel.topic) embed.addFields({ name: '📝 Topic', value: channel.topic });
        if (channel.rateLimitPerUser) embed.addFields({ name: '🐢 Slowmode', value: `${channel.rateLimitPerUser}s`, inline: true });
        if (channel.nsfw !== undefined) embed.addFields({ name: '🔞 NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true });
        if (channel.parentId) embed.addFields({ name: '📂 Category', value: `<#${channel.parentId}>`, inline: true });

        await interaction.reply({ embeds: [embed] });
    },
};
