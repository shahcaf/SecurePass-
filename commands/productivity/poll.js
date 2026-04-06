const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors, errorEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a simple yes/no or multi-option poll.')
        .addStringOption(o => o.setName('question').setDescription('The poll question.').setRequired(true))
        .addStringOption(o => o.setName('options').setDescription('Comma-separated options (leave blank for Yes/No).')),

    async execute(interaction) {
        const question = interaction.options.getString('question');
        const optionsRaw = interaction.options.getString('options');

        const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

        let options, description;

        if (optionsRaw) {
            options = optionsRaw.split(',').map(o => o.trim()).filter(Boolean);
            if (options.length < 2) return interaction.reply({ embeds: [errorEmbed('Please provide at least 2 options.')], ephemeral: true });
            if (options.length > 10) return interaction.reply({ embeds: [errorEmbed('Maximum 10 options allowed.')], ephemeral: true });
            description = options.map((opt, i) => `${numberEmojis[i]} ${opt}`).join('\n');
        } else {
            options = ['Yes', 'No'];
            description = '👍 Yes\n👎 No';
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.Primary)
            .setTitle(`📊 ${question}`)
            .setDescription(description)
            .setFooter({ text: `Poll by ${interaction.user.tag}` })
            .setTimestamp();

        const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

        if (optionsRaw) {
            for (let i = 0; i < options.length; i++) {
                await msg.react(numberEmojis[i]).catch(() => {});
            }
        } else {
            await msg.react('👍').catch(() => {});
            await msg.react('👎').catch(() => {});
        }
    },
};
