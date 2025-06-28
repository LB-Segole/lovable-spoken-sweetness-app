
const Database = require('better-sqlite3');
const path = require('path');

function initializeDatabase() {
  const dbPath = path.join(__dirname, 'voice-agent.db');
  const db = new Database(dbPath);

  console.log('🗄️ Initializing local database...');

  // Create tables if they don't exist
  try {
    // Users table (for local auth)
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Voice agents table
    db.exec(`
      CREATE TABLE IF NOT EXISTS voice_agents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        system_prompt TEXT NOT NULL,
        first_message TEXT,
        voice_provider TEXT DEFAULT 'deepgram',
        voice_id TEXT DEFAULT 'aura-asteria-en',
        model TEXT DEFAULT 'nova-2',
        temperature REAL DEFAULT 0.8,
        max_tokens INTEGER DEFAULT 500,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Assistants table
    db.exec(`
      CREATE TABLE IF NOT EXISTS assistants (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        system_prompt TEXT NOT NULL,
        first_message TEXT,
        voice_provider TEXT DEFAULT 'openai',
        voice_id TEXT DEFAULT 'alloy',
        model TEXT DEFAULT 'gpt-4o',
        temperature REAL DEFAULT 0.8,
        max_tokens INTEGER DEFAULT 500,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Call logs table
    db.exec(`
      CREATE TABLE IF NOT EXISTS call_logs (
        id TEXT PRIMARY KEY,
        call_id TEXT,
        speaker TEXT NOT NULL,
        content TEXT NOT NULL,
        confidence REAL DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
  }

  db.close();
}

module.exports = { initializeDatabase };
