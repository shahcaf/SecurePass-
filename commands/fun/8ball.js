const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

const responses = [
    // Positive
    'It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes, definitely.',
    'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.',
    'Yes.', 'Signs point to yes.',
    // Neutral
    'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.',
    'Cannot predict now.', 'Concentrate and ask again.',
    // Negative
    "Don't count on it.", 'My reply is no.', 'My sources say no.',
    'Outlook not so good.', 'Very doubtful.',
];

const positiveResponses = responses.slice(0, 10);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question.')
        .addStringOption(o => o.setName('question').setDescription('Your yes/no question.').setRequired(true)),

    async execute(interaction) {
        const question = interaction.options.getString('question');
        const answer = responses[Math.floor(Math.random() * responses.length)];
        const isPositive = positiveResponses.includes(answer);
        const isNegative = answer.includes('no') || answer.includes('not') || answer.includes('doubtful');

        const color = isNegative ? Colors.Error : isPositive ? Colors.Success : Colors.Warning;

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🎱 Magic 8-Ball')
            .addFields(
                { name: '❓ Question', value: question },
                { name: '🎱 Answer', value: answer },
            )
            .setFooter({ text: `Asked by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
