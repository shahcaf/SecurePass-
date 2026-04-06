const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Bulk delete messages in a channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to delete (1–100).').setRequired(true).setMinValue(1).setMaxValue(100))
        .addUserOption(o => o.setName('user').setDescription('Only delete messages from this user.')),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const filterUser = interaction.options.getUser('user');

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ embeds: [errorEmbed('I need the **Manage Messages** permission.')], ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        let messages = await interaction.channel.messages.fetch({ limit: 100 });

        // Filter by user if specified
        if (filterUser) messages = messages.filter(m => m.author.id === filterUser.id);

        // Only messages younger than 14 days (Discord API limit)
        const twoWeeks = Date.now() - 14 * 24 * 60 * 60 * 1000;
        messages = messages.filter(m => m.createdTimestamp > twoWeeks).first(amount);

        if (messages.length === 0) {
            return interaction.editReply({ embeds: [errorEmbed('No eligible messages found to delete (messages must be <14 days old).')] });
        }

        const deleted = await interaction.channel.bulkDelete(messages, true);
        await interaction.editReply({ embeds: [successEmbed(`Deleted **${deleted.size}** message(s).`)] });
    },
};
