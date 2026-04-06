# SecurePass - Global Verification Discord Bot

SecurePass is a premium global verification platform built for Discord. Once a user verifies in one server using SecurePass, they are automatically recognized as verified across all servers using the bot.

## Core Features
- **Global Trust System**: Verify once, trusted everywhere.
- **Auto-Verification**: Returning verified users automatically receive the configured role.
- **Global Blacklist**: Instantly remove malicious users across the entire network.
- **Simple Setup**: Intuitive `/setup` command for administrators.
- **Security First**: Anti-alt, account age checks, and manual button verification.

## Tech Stack
- **Runtime**: Node.js (Latest LTS)
- **Library**: Discord.js
- **Database**: CockroachDB (PostgreSQL compatible)
- **Deployment**: Render

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory and add:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_application_id_here
DATABASE_URL=your_cockroachdb_connection_string_here
```

### 2. Database Schema
Run the contents of `schema.sql` in your CockroachDB console to create the necessary tables.

### 3. Deploy Slash Commands
Before running the bot, register the global slash commands:
```bash
node deploy-commands.js
```

### 4. Run the Bot
```bash
node index.js
```

## Commands
| Command | Description | Permission |
|---------|-------------|------------|
| `/setup` | Configure the verified role and channel | Administrator |
| `/verify` | Start the global verification process | Everyone |
| `/status` | Check your verification status and standings | Everyone |
| `/blacklist` | Globally blacklist a user | Administrator (Internal) |
| `/config` | View current server settings | Administrator |

## Global Verification Flow
1. User joins a server.
2. Bot checks if the `user_id` is in the global `users` table as `verified`.
3. If **Verified**, the role is automatically assigned.
4. If **Not Verified**, the user is prompted to verify via a button interaction in the configured channel.
5. Once verified via captcha button, the global status is updated, and the role is assigned.

---
*Built with ❤️ for secure Discord communities.*
