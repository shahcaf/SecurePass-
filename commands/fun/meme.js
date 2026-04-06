const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');

// Curated list of subreddits known for SFW memes
const MEME_SUBREDDITS = ['memes', 'dankmemes', 'me_irl', 'AdviceAnimals', 'ProgrammerHumor'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Fetch a random meme from Reddit.'),

    async execute(interaction) {
        await interaction.deferReply();

        const subreddit = MEME_SUBREDDITS[Math.floor(Math.random() * MEME_SUBREDDITS.length)];

        try {
            const res = await fetch(`https://www.reddit.com/r/${subreddit}/random.json?limit=1`, {
                headers: { 'User-Agent': 'DiscordUtilityBot/1.0' },
            });

            if (!res.ok) throw new Error('Reddit API unavailable');

            const data = await res.json();
            const post = data?.[0]?.data?.children?.[0]?.data;

            if (!post || post.over_18 || !post.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                return interaction.editReply({ content: '😔 Could not find a suitable meme. Try again!' });
            }

            const embed = new EmbedBuilder()
                .setColor(Colors.Primary)
                .setTitle(post.title.slice(0, 256))
                .setURL(`https://reddit.com${post.permalink}`)
                .setImage(post.url)
                .setFooter({ text: `👍 ${post.ups.toLocaleString()} · r/${subreddit}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch {
            await interaction.editReply({ content: '❌ Failed to fetch a meme. Reddit may be unavailable.' });
        }
    },
};
