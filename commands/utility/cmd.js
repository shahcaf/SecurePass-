const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');
const { readdirSync } = require('fs');
const path = require('path');

const CATEGORIES = {
    utility:    { label: 'General Utility', emoji: '🔧', desc: 'Core bot stats and system tools.' },
    moderation: { label: 'Moderation', emoji: '🔨', desc: 'Server management and user control.' },
    administration: { label: 'Admin Setup', emoji: '⚙️', desc: 'Global config and development tools.' },
    productivity: { label: 'Productivity', emoji: '📋', desc: 'Polls, logs, and server flow tools.' },
    fun:        { label: 'Entertainment', emoji: '🎉', desc: 'Mini-games and social fun.' },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cmd')
        .setDescription('Show all available bot commands and security features.')
        .addStringOption(o => o.setName('command').setDescription('Get help for a specific command.')),

    async execute(interaction) {
        const client = interaction.client;
        const commandName = interaction.options.getString('command');

        if (commandName) {
            const cmd = client.commands.get(commandName.toLowerCase());
            if (!cmd) return interaction.reply({ content: `❌ No command named \`${commandName}\` found.`, ephemeral: true });

            const embed = new EmbedBuilder()
                .setColor(Colors.Primary)
                .setTitle(`📖 /${cmd.data.name}`)
                .setDescription(cmd.data.description)
                .addFields({ name: 'Usage', value: `\`/${cmd.data.name}${cmd.data.options.length ? ' [...options]' : ''}\`` })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const mainEmbed = new EmbedBuilder()
            .setColor(Colors.Primary)
            .setTitle(`📚 ${client.user.username} — Help Center`)
            .setDescription(`Welcome to the Command Center! Select a category from the dropdown menu to see full details.\n\nTotal Commands: **${client.commands.size}**`)
            .addFields(
                { name: '🔧 General', value: '`/ping`, `/botinfo`, `/invite` ...', inline: true },
                { name: '🔨 Staff', value: '`/setup`, `/config`, `/logs` ...', inline: true },
                { name: '🎉 Fun', value: '`/rps`, `/joke`, `/dice` ...', inline: true }
            )
            .setThumbnail(client.user.displayAvatarURL({ size: 128 }))
            .setFooter({ text: 'Select a category below to explore!' });

        const menu = new StringSelectMenuBuilder()
            .setCustomId('cmd_category_select')
            .setPlaceholder('Select a category...')
            .addOptions(Object.entries(CATEGORIES).map(([id, cat]) => ({
                label: cat.label,
                description: cat.desc,
                value: `cat_${id}`,
                emoji: cat.emoji
            })));

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({ embeds: [mainEmbed], components: [row], ephemeral: true });
    },

    async handleComponent(interaction) {
        if (!interaction.isStringSelectMenu()) return;
        const selection = interaction.values[0].replace('cat_', '');
        const client = interaction.client;
        const commandsPath = path.join(__dirname, '..', '..');

        const catData = CATEGORIES[selection];
        if (!catData) return;

        const cmdFiles = [];
        try {
            const files = readdirSync(path.join(commandsPath, 'commands', selection));
            files.forEach(f => {
                const cmdName = f.split('.')[0];
                const cmdObj = client.commands.get(cmdName);
                if (cmdObj) cmdFiles.push(`\`/${cmdName}\` - ${cmdObj.data.description}`);
            });
        } catch {}

        const helpEmbed = new EmbedBuilder()
            .setColor(Colors.Primary)
            .setTitle(`${catData.emoji} ${catData.label} Commands`)
            .setDescription(cmdFiles.length > 0 ? cmdFiles.join('\n') : 'No commands in this category.')
            .setFooter({ text: `${client.user.username} • ${catData.label} Section`, iconURL: client.user.displayAvatarURL() });

        await interaction.update({ embeds: [helpEmbed] });
    }
};
