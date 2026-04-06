const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require('discord.js');
const db = require('../utils/db');
const captcha = require('../utils/captcha');
const logger = require('../utils/logger');

// Temporary store for captcha codes
const pendingCaptchas = new Map();

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    const { user, guildId, client } = interaction;

    // --- Slash Command Handling ---
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        const errorMsg = '❌ There was an error while executing this command!';
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ content: errorMsg });
        } else {
          await interaction.reply({ content: errorMsg, ephemeral: true });
        }
      }
    }

    // --- Button Handling ---
    if (interaction.isButton()) {
      if (interaction.customId.startsWith('verify_start_')) {
        // --- Global Blacklist Check ---
        const isBlacklisted = await db.isBlacklisted(user.id);
        if (isBlacklisted) {
          return interaction.reply({ content: '❌ You are globally blacklisted from SecurePass and cannot verify.', ephemeral: true });
        }

        // If it's from the panel (no specific user ID) or it belongs to the user
        const targetUserId = interaction.customId.split('_')[2];
        if (targetUserId !== 'panel' && user.id !== targetUserId) {
          return interaction.reply({ content: '❌ This verification sequence is not for you.', ephemeral: true });
        }

        const { code, buffer } = captcha.generate();
        pendingCaptchas.set(user.id, code);

        const attachment = new AttachmentBuilder(buffer, { name: 'captcha.png' });
        const embed = new EmbedBuilder()
          .setTitle('🛡️ Security Check Required')
          .setDescription('To complete your global verification, please solve the image captcha below. Click the button to enter the code.')
          .setImage('attachment://captcha.png')
          .setColor('#00ff7f')
          .setFooter({ text: 'SecurePass • maded by <@1414542711683289152>' });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`verify_solve_${user.id}`)
            .setLabel('Solve Captcha')
            .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({ embeds: [embed], files: [attachment], components: [row], ephemeral: true });
      }

      if (interaction.customId.startsWith('verify_solve_')) {
        const userId = interaction.customId.split('_')[2];
        if (user.id !== userId) return;

        const modal = new ModalBuilder()
          .setCustomId(`modal_captcha_${user.id}`)
          .setTitle('Enter Captcha Code');

        const input = new TextInputBuilder()
          .setCustomId('captcha_input')
          .setLabel('TYPE THE CODE SHOWN IN THE IMAGE')
          .setStyle(TextInputStyle.Short)
          .setMinLength(6)
          .setMaxLength(6)
          .setPlaceholder('Enter code...')
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
      }
    }

    // --- Modal Handling ---
    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('modal_captcha_')) {
        const inputCode = interaction.fields.getTextInputValue('captcha_input').toUpperCase();
        const correctCode = pendingCaptchas.get(user.id);

        if (inputCode === correctCode) {
          pendingCaptchas.delete(user.id);

          // Update Global DB
          await db.upsertUser(user.id, true, 'IMAGE_CAPTCHA');

          // Assign Role in Current Server
          const serverConfig = await db.getServer(guildId);
          if (serverConfig && serverConfig.role_id) {
            const role = interaction.guild.roles.cache.get(serverConfig.role_id);
            if (role) {
              await interaction.member.roles.add(role).catch(console.error);
            }
          }

          const successEmbed = new EmbedBuilder()
            .setTitle('✅ Verification Successful!')
            .setDescription('Your SecurePass identity has been verified and updated in our global network.')
            .setColor('#00ff00')
            .setFooter({ text: 'SecurePass • maded by <@1414542711683289152>' });

          await interaction.reply({ embeds: [successEmbed], ephemeral: true });
          await logger.log(interaction.guild, user, 'VERIFIED_SUCCESS_CAPTCHA', '#00ff00');
        } else {
          await interaction.reply({ content: '❌ Invalid captcha code. Please try again with `/verify`.', ephemeral: true });
        }
      }
    }

    // --- Select Menu Handling ---
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'cmd_category_select') {
        const selection = interaction.values[0];
        const helpEmbed = new EmbedBuilder()
          .setColor('#00ff7f')
          .setFooter({ text: 'SecurePass • maded by <@1414542711683289152>', iconURL: client.user.displayAvatarURL() });

        if (selection === 'cat_user') {
          helpEmbed.setTitle('👤 User Commands')
            .setDescription('These public commands are available for everyone.')
            .addFields(
              { name: '🔍 /status', value: 'Check your own global verification status.', inline: true },
              { name: '👥 /userinfo', value: 'View your detailed global security profile.', inline: true },
              { name: '✨ /credits', value: 'View the designers and developers.', inline: true },
              { name: '⚡ /ping', value: 'Test the current bot performance.', inline: true }
            );
        } else if (selection === 'cat_admin') {
          helpEmbed.setTitle('⚙️ Admin Commands')
            .setDescription('These commands are restricted to server staff or developers.')
            .addFields(
              { name: '🛠️ /setup', value: 'Configure verified role and log channel.', inline: true },
              { name: '📜 /config', value: 'View current server configuration.', inline: true },
              { name: '🔗 /antilink', value: 'Toggle the anti-link protection system.', inline: true },
              { name: '📊 /serverlist', value: '**Developer Only.** View bot network.', inline: true },
              { name: '📈 /info', value: 'View global bot statistics.', inline: true }
            );
        } else if (selection === 'cat_security') {
          helpEmbed.setTitle('🛡️ Security & Protection')
            .setDescription('Advanced tools for managing global blacklists and safety.')
            .addFields(
              { name: '🚨 /blacklist', value: 'Globally ban a user from SecurePass.', inline: true },
              { name: '🛡️ /unblacklist', value: 'Remove a global ban from a user.', inline: true }
            );
        }

        await interaction.update({ embeds: [helpEmbed] });
      }
    }
  }
};
