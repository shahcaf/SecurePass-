require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('./utils/db');
const { initDatabase } = require('./database/db'); // Utility Database
require('colors');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
client.cooldowns = new Collection(); // For Utility Commands

// Recursive Command Loader
const commandsPath = path.join(__dirname, 'commands');
const loadCommandsRecursive = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      loadCommandsRecursive(filePath);
    } else if (file.endsWith('.js')) {
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      }
    }
  }
};
loadCommandsRecursive(commandsPath);

// Load Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

(async () => {
  try {
    // Initialize both databases
    initDatabase(); // (SQLite WASM)
    console.log('✅ Utility Database initialized.');
    
    // Login
    client.login(process.env.DISCORD_TOKEN || process.env.BOT_TOKEN);
  } catch (error) {
    console.error('❌ Failed to start the bot:', error);
  }
})();

// --- Keep-alive HTTP server for Render Web Service ---
const http = require('http');
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('SecurePass is online.');
}).listen(PORT, () => {
  console.log(`🌐 Health server running on port ${PORT}`);
});
