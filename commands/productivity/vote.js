const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Create a quick thumbs-up/thumbs-down vote.')
        .addStringOption(o => o.setName('topic').setDescription('What are people voting on?').setRequired(true)),

    async execute(interaction) {
        const topic = interaction.options.getString('topic');

        const embed = new EmbedBuilder()
            .setColor(Colors.Info)
            .setTitle('🗳️ Vote!')
            .setDescription(`**${topic}**\n\nReact with 👍 to agree or 👎 to disagree.`)
            .setFooter({ text: `Vote started by ${interaction.user.tag}` })
            .setTimestamp();

        const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
        await msg.react('👍').catch(() => {});
        await msg.react('👎').catch(() => {});
    },
};
