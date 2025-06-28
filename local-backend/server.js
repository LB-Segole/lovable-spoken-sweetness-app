
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { initializeDatabase } = require('./init-db');

// Initialize database on startup
initializeDatabase();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Database connection
const dbPath = path.join(__dirname, 'voice-agent.db');
let db;

// Initialize database connection with retry logic
const initDB = () => {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err);
      setTimeout(initDB, 1000); // Retry after 1 second
    } else {
      console.log('✅ Connected to SQLite database');
    }
  });
};

initDB();

// Helper functions to promisify sqlite3 methods
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
};

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Local backend is running' });
});

// Auth routes
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const userId = uuidv4();
    await dbRun('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)', 
      [userId, email, passwordHash, name || '']);
    
    // Generate token
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      token,
      user: { id: userId, email, name: name || '' }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name || '' }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/auth/user', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, email, name FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Voice agents routes
app.get('/voice_agents', authenticateToken, async (req, res) => {
  try {
    const agents = await dbAll('SELECT * FROM voice_agents WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ data: agents });
  } catch (error) {
    console.error('Get voice agents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/voice_agents', authenticateToken, async (req, res) => {
  try {
    const agentId = uuidv4();
    const agentData = {
      id: agentId,
      user_id: req.user.id,
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await dbRun(`
      INSERT INTO voice_agents 
      (id, user_id, name, system_prompt, first_message, voice_provider, voice_id, model, temperature, max_tokens, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      agentData.id,
      agentData.user_id,
      agentData.name,
      agentData.system_prompt,
      agentData.first_message,
      agentData.voice_provider || 'deepgram',
      agentData.voice_id || 'aura-asteria-en',
      agentData.model || 'nova-2',
      agentData.temperature || 0.8,
      agentData.max_tokens || 500,
      agentData.is_active !== false ? 1 : 0,
      agentData.created_at,
      agentData.updated_at
    ]);
    
    res.json({ data: agentData });
  } catch (error) {
    console.error('Create voice agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/voice_agents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    const result = await dbRun(`
      UPDATE voice_agents 
      SET name = ?, system_prompt = ?, first_message = ?, voice_provider = ?, voice_id = ?, model = ?, temperature = ?, max_tokens = ?, is_active = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `, [
      updateData.name,
      updateData.system_prompt,
      updateData.first_message,
      updateData.voice_provider,
      updateData.voice_id,
      updateData.model,
      updateData.temperature,
      updateData.max_tokens,
      updateData.is_active !== false ? 1 : 0,
      updateData.updated_at,
      id,
      req.user.id
    ]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Voice agent not found' });
    }
    
    const updatedAgent = await dbGet('SELECT * FROM voice_agents WHERE id = ?', [id]);
    res.json({ data: updatedAgent });
  } catch (error) {
    console.error('Update voice agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/voice_agents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbRun('DELETE FROM voice_agents WHERE id = ? AND user_id = ?', [id, req.user.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Voice agent not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete voice agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assistants routes
app.get('/assistants', authenticateToken, async (req, res) => {
  try {
    const assistants = await dbAll('SELECT * FROM assistants WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ data: assistants });
  } catch (error) {
    console.error('Get assistants error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/assistants', authenticateToken, async (req, res) => {
  try {
    const assistantId = uuidv4();
    const assistantData = {
      id: assistantId,
      user_id: req.user.id,
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await dbRun(`
      INSERT INTO assistants 
      (id, user_id, name, system_prompt, first_message, voice_provider, voice_id, model, temperature, max_tokens, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      assistantData.id,
      assistantData.user_id,
      assistantData.name,
      assistantData.system_prompt,
      assistantData.first_message,
      assistantData.voice_provider || 'openai',
      assistantData.voice_id || 'alloy',
      assistantData.model || 'gpt-4o',
      assistantData.temperature || 0.8,
      assistantData.max_tokens || 500,
      assistantData.created_at,
      assistantData.updated_at
    ]);
    
    res.json({ data: assistantData });
  } catch (error) {
    console.error('Create assistant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down local backend...');
  if (db) {
    db.close((err) => {
      if (err) console.error('Error closing database:', err);
      else console.log('Database connection closed');
    });
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (db) {
    db.close();
  }
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Local backend running on http://localhost:${PORT}`);
  console.log('📊 Database initialized and ready');
});
