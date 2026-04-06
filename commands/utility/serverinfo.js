const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display information about this server.'),

    async execute(interaction) {
        await interaction.deferReply();
        const guild = interaction.guild;
        await guild.fetch();

        const owner = await guild.fetchOwner().catch(() => null);
        const channels = guild.channels.cache;
        const textChannels = channels.filter(c => c.type === 0).size;
        const voiceChannels = channels.filter(c => c.type === 2).size;
        const categoryChannels = channels.filter(c => c.type === 4).size;
        const boostLevel = guild.premiumTier;
        const boostCount = guild.premiumSubscriptionCount;

        const embed = new EmbedBuilder()
            .setColor(Colors.Primary)
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .setImage(guild.bannerURL({ size: 1024 }) || null)
            .addFields(
                { name: '👑 Owner', value: owner ? `${owner.user.tag}` : 'Unknown', inline: true },
                { name: '🆔 Server ID', value: guild.id, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
                { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
                { name: '🔱 Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
                { name: '📢 Channels', value: `💬 Text: ${textChannels} | 🔊 Voice: ${voiceChannels} | 📂 Categories: ${categoryChannels}`, inline: false },
                { name: '🚀 Boost', value: `Level ${boostLevel} · ${boostCount} boost(s)`, inline: true },
                { name: '🔒 Verification', value: guild.verificationLevel.toString(), inline: true },
            )
            .setFooter({ text: `Region: ${guild.preferredLocale}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
