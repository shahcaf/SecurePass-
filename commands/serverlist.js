const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const OWNER_ID = '1414542711683289152';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverlist')
    .setDescription('Developer Only: List all servers featuring SecurePass protection.'),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ This command is restricted to the bot developer only.', ephemeral: true });
    }

    const guilds = interaction.client.guilds.cache;
    const embed = new EmbedBuilder()
      .setTitle('🌐 SecurePass Network Explorer')
      .setDescription(`Currently securing **${guilds.size}** servers across Discord.`)
      .setColor('#3498db')
      .setFooter({ text: 'Developer Portal • made by <@1414542711683289152>' });

    const serverList = [];
    for (const guild of guilds.values()) {
      let invite = 'No Public Invite Found';
      try {
        const invites = await guild.invites.fetch().catch(() => null);
        if (invites && invites.size > 0) {
          invite = `[Join Link](${invites.first().url})`;
        } else if (guild.features.includes('VANITY_URL')) {
          invite = `[Vanity Link](https://discord.gg/${guild.vanityURLCode})`;
        }
      } catch (e) {}

      serverList.push(`**${guild.name}**\n👤 ${guild.memberCount} members | ${invite}`);
    }

    // Handle large server lists with multiple fields
    const chunks = [];
    while (serverList.length > 0) {
      chunks.push(serverList.splice(0, 5).join('\n\n'));
    }

    chunks.forEach((chunk, i) => {
      embed.addFields({ name: `Server Group ${i + 1}`, value: chunk });
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
