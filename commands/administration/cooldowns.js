const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, Colors } = require('../../utils/embeds');
const { setCooldown, getCooldown } = require('../../utils/cooldowns');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cooldowns')
        .setDescription('View or change the command cooldown for this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(s => s.setName('view').setDescription('View the current cooldown setting.'))
        .addSubcommand(s => s
            .setName('set')
            .setDescription('Set the cooldown in seconds.')
            .addIntegerOption(o => o.setName('seconds').setDescription('Seconds between commands (0 = disabled).').setRequired(true).setMinValue(0).setMaxValue(60))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'view') {
            const current = getCooldown(interaction.guildId);
            const embed = new EmbedBuilder()
                .setColor(Colors.Primary)
                .setTitle('⏱️ Command Cooldown')
                .setDescription(current === 0
                    ? 'Cooldowns are currently **disabled**.'
                    : `Current cooldown: **${current} second(s)** between commands.`)
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (sub === 'set') {
            const seconds = interaction.options.getInteger('seconds');
            setCooldown(interaction.guildId, seconds);

            const msg = seconds === 0
                ? 'Command cooldowns have been **disabled**.'
                : `Command cooldown set to **${seconds} second(s)**.`;

            return interaction.reply({ embeds: [successEmbed(msg)] });
        }
    },
};
