require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to CockroachDB successfully.');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('Initializing database tables...');
    await client.query(schema);

    // Addition: migrate log_channel_id if it's missing from previous runs
    try {
      await client.query('ALTER TABLE servers ADD COLUMN IF NOT EXISTS log_channel_id VARCHAR(255)');
      await client.query('ALTER TABLE servers ADD COLUMN IF NOT EXISTS anti_link BOOLEAN DEFAULT FALSE');
      console.log('Migration: log_channel_id and anti_link columns ensured.');
    } catch (e) {
      console.log('Migration notice:', e.message);
    }

    // Split SQL by semicolons and remove empty strings/whitespace
    const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      console.log(`Running: ${statement.substring(0, 50)}...`);
      await client.query(statement);
    }

    console.log('✅ Database initialization complete! All tables created.');
  } catch (err) {
    console.error('❌ Error during SQL execution:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDB();
