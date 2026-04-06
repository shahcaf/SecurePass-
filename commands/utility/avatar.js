const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Display a user\'s avatar.')
        .addUserOption(o => o.setName('user').setDescription('The user whose avatar to show (defaults to you).')),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;

        const formats = ['png', 'jpg', 'webp'];
        const links = formats.map(f => `[${f.toUpperCase()}](${user.displayAvatarURL({ extension: f, size: 4096 })})`).join(' · ');

        const embed = new EmbedBuilder()
            .setColor(Colors.Primary)
            .setTitle(`🖼️ Avatar — ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setDescription(links)
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
