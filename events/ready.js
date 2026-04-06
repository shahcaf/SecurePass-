const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ Success! SecurePass is online as ${client.user.tag}`.green.bold);
    console.log(`🛡️  Monitoring ${client.guilds.cache.size} servers.`.blue);
  },
};
