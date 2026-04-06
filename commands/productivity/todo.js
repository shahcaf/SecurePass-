const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, Colors } = require('../../utils/embeds');
const { getDb } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('todo')
        .setDescription('Manage your personal to-do list.')
        .addSubcommand(s => s
            .setName('add')
            .setDescription('Add a task.')
            .addStringOption(o => o.setName('task').setDescription('The task to add.').setRequired(true)))
        .addSubcommand(s => s.setName('list').setDescription('View your to-do list.'))
        .addSubcommand(s => s
            .setName('done')
            .setDescription('Mark a task as completed.')
            .addIntegerOption(o => o.setName('id').setDescription('Task ID to mark done.').setRequired(true)))
        .addSubcommand(s => s
            .setName('remove')
            .setDescription('Remove a task.')
            .addIntegerOption(o => o.setName('id').setDescription('Task ID to remove.').setRequired(true))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const db = getDb();
        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        if (sub === 'add') {
            const task = interaction.options.getString('task');
            const count = db.prepare('SELECT COUNT(*) as c FROM todos WHERE user_id = ? AND guild_id = ?').get(userId, guildId).c;
            if (count >= 20) return interaction.reply({ embeds: [errorEmbed('You can have a maximum of 20 tasks.')], ephemeral: true });

            db.prepare('INSERT INTO todos (user_id, guild_id, task) VALUES (?, ?, ?)').run(userId, guildId, task);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(Colors.Success).setDescription(`✅ Task added: **${task}**`).setTimestamp()], ephemeral: true });
        }

        if (sub === 'list') {
            const todos = db.prepare('SELECT * FROM todos WHERE user_id = ? AND guild_id = ? ORDER BY id ASC').all(userId, guildId);
            if (todos.length === 0) return interaction.reply({ embeds: [errorEmbed('Your to-do list is empty.')], ephemeral: true });

            const list = todos.map(t => `${t.completed ? '✅' : '⬜'} **#${t.id}** — ${t.task}`).join('\n');

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Primary)
                    .setTitle('📋 Your To-Do List')
                    .setDescription(list)
                    .setFooter({ text: `${todos.filter(t => t.completed).length}/${todos.length} completed` })
                    .setTimestamp()],
                ephemeral: true,
            });
        }

        if (sub === 'done') {
            const id = interaction.options.getInteger('id');
            const todo = db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?').get(id, userId);
            if (!todo) return interaction.reply({ embeds: [errorEmbed(`No task found with ID #${id}.`)], ephemeral: true });
            db.prepare('UPDATE todos SET completed = 1 WHERE id = ?').run(id);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(Colors.Success).setDescription(`✅ Task #${id} marked as completed!`).setTimestamp()], ephemeral: true });
        }

        if (sub === 'remove') {
            const id = interaction.options.getInteger('id');
            const todo = db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?').get(id, userId);
            if (!todo) return interaction.reply({ embeds: [errorEmbed(`No task found with ID #${id}.`)], ephemeral: true });
            db.prepare('DELETE FROM todos WHERE id = ?').run(id);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(Colors.Success).setDescription(`🗑️ Task #${id} removed.`).setTimestamp()], ephemeral: true });
        }
    },
};
