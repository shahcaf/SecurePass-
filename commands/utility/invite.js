const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Colors } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the bot\'s official invite link.'),

    async execute(interaction) {
        const inviteUrl = 'https://discord.com/oauth2/authorize?client_id=1490543537505308892&permissions=8&integration_type=0&scope=bot';

        const embed = new EmbedBuilder()
            .setColor(Colors.Primary)
            .setTitle('📥 Add SecurePass to Your Server')
            .setDescription('Secure your Discord community with advanced verification, anti-bot protection, and automated role management.')
            .addFields(
                { name: '🚀 Quick Setup', value: 'Invite the bot, run `/setup`, and you\'re ready to go!', inline: false },
                { name: '🛡️ Enterprise Features', value: 'CAPTCHA, Alt Detection, Anti-Bot & more included for free.', inline: false }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: 'SecurePass • Professional Security for Discord' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Invite SecurePass')
                    .setURL(inviteUrl)
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('Visit Website')
                    .setURL('https://shahcaf.github.io/SecurePass-add-me/')
                    .setStyle(ButtonStyle.Link)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
