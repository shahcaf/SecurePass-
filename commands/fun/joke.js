const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

const jokes = [
    { setup: 'Why do programmers prefer dark mode?', punchline: 'Because light attracts bugs!' },
    { setup: 'Why did the scarecrow win an award?', punchline: 'Because he was outstanding in his field!' },
    { setup: 'What do you call a fish without eyes?', punchline: 'A fsh!' },
    { setup: 'Why can\'t you give Elsa a balloon?', punchline: 'Because she\'ll let it go!' },
    { setup: 'What do you call a fake noodle?', punchline: 'An impasta!' },
    { setup: 'Why did the math book look so sad?', punchline: 'Because it had too many problems.' },
    { setup: 'What do you call cheese that isn\'t yours?', punchline: 'Nacho cheese!' },
    { setup: 'Why don\'t scientists trust atoms?', punchline: 'Because they make up everything!' },
    { setup: 'How does a penguin build its house?', punchline: 'Igloos it together!' },
    { setup: 'What do you call a sleeping dinosaur?', punchline: 'A dino-snore!' },
    { setup: 'Why did the bicycle fall over?', punchline: 'Because it was two-tired!' },
    { setup: 'What\'s a computer\'s favorite snack?', punchline: 'Microchips!' },
    { setup: 'Why did the developer quit his job?', punchline: 'Because he didn\'t get arrays!' },
    { setup: 'What do you call an alligator in a vest?', punchline: 'An investigator!' },
    { setup: 'How do you organize a space party?', punchline: 'You planet!' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Get a random joke.'),

    async execute(interaction) {
        const joke = jokes[Math.floor(Math.random() * jokes.length)];

        const embed = new EmbedBuilder()
            .setColor(Colors.Warning)
            .setTitle('😂 Random Joke')
            .addFields(
                { name: '❓ Setup', value: joke.setup },
                { name: '😄 Punchline', value: `||${joke.punchline}||` },
            )
            .setFooter({ text: 'Click the punchline to reveal it!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
