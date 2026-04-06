const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display information about a user.')
        .addUserOption(o => o.setName('user').setDescription('The user to look up (defaults to you).')),

    async execute(interaction) {
        await interaction.deferReply();
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        const roles = member
            ? member.roles.cache.filter(r => r.id !== interaction.guildId)
                .sort((a, b) => b.position - a.position)
                .map(r => `<@&${r.id}>`)
                .slice(0, 10)
                .join(' ') || 'None'
            : 'Not in server';

        const embed = new EmbedBuilder()
            .setColor(member?.displayHexColor || Colors.Primary)
            .setTitle(`${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🆔 User ID', value: user.id, inline: true },
                { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
                ...(member ? [
                    { name: '📆 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true },
                    { name: '🎨 Nickname', value: member.nickname || 'None', inline: true },
                    { name: '🔝 Top Role', value: `${member.roles.highest}`, inline: true },
                    { name: `🔱 Roles (${member.roles.cache.size - 1})`, value: roles },
                ] : []),
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
