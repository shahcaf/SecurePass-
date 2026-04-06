-- Database schema for SecurePass

-- Users table: user_id, verified, method, created_at
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(255) PRIMARY KEY,
  verified BOOLEAN DEFAULT FALSE,
  method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Servers table: server_id, role_id, channel_id, auto_verify, settings
CREATE TABLE IF NOT EXISTS servers (
  server_id VARCHAR(255) PRIMARY KEY,
  role_id VARCHAR(255),
  channel_id VARCHAR(255),
  log_channel_id VARCHAR(255),
  auto_verify BOOLEAN DEFAULT TRUE,
  anti_link BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}'
);

-- Blacklist table: user_id, reason, created_at
CREATE TABLE IF NOT EXISTS blacklist (
  user_id VARCHAR(255) PRIMARY KEY,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs table: id, event, user_id, server_id, created_at
CREATE TABLE IF NOT EXISTS whitelist (
  server_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  PRIMARY KEY (server_id, user_id)
);

CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  event TEXT,
  user_id VARCHAR(255),
  server_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
