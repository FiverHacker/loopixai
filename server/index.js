const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const fs = require('fs');
const fetch = require('node-fetch');
const initSqlJs = require('sql.js');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'loopix-ai-secret-key-2024';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

let db;

function saveDb() {
  const data = db.export();
  fs.writeFileSync(path.join(__dirname, 'loopix.db'), Buffer.from(data));
}

function dbRun(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

function dbGet(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const cols = stmt.getColumnNames();
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function dbAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

async function initDb() {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'loopix.db');
  let buffer;
  try {
    buffer = fs.readFileSync(dbPath);
  } catch {
    buffer = null;
  }
  db = new SQL.Database(buffer);
  
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    avatar TEXT DEFAULT '',
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    model TEXT DEFAULT 'gpt-3.5-turbo',
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS ai_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    api_url TEXT NOT NULL,
    api_key TEXT DEFAULT '',
    model_id TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
  )`);
  saveDb();

  const defaultSettings = {
    site_name: 'Loopix AI',
    site_description: 'Your Intelligent AI Assistant',
    favicon_url: '',
    logo_url: '',
    primary_color: '#10a37f',
    secondary_color: '#1a1a2e',
    accent_color: '#7c3aed',
    allow_registration: 'true',
    default_model: '',
    system_prompt: 'You are a helpful, friendly AI assistant.'
  };

  const existingRows = dbAll('SELECT key FROM site_settings');
  const existingKeys = existingRows.map(s => s.key);
  for (const [key, value] of Object.entries(defaultSettings)) {
    if (!existingKeys.includes(key)) {
      dbRun('INSERT INTO site_settings (key, value) VALUES (?, ?)', [key, String(value)]);
    }
  }

  const count = dbGet('SELECT COUNT(*) as count FROM ai_models');
  if (count.count === 0) {
    const defaultModels = [
      { name: 'GPT-3.5 Turbo', provider: 'openai', api_url: 'https://api.openai.com/v1/chat/completions', api_key: '', model_id: 'gpt-3.5-turbo', is_active: 1, is_default: 1 },
      { name: 'GPT-4', provider: 'openai', api_url: 'https://api.openai.com/v1/chat/completions', api_key: '', model_id: 'gpt-4', is_active: 1, is_default: 0 },
      { name: 'NVIDIA Llama 3.1 8B', provider: 'nvidia', api_url: 'https://integrate.api.nvidia.com/v1/chat/completions', api_key: '', model_id: 'meta/llama-3.1-8b-instruct', is_active: 1, is_default: 0 },
      { name: 'NVIDIA Llama 3.1 70B', provider: 'nvidia', api_url: 'https://integrate.api.nvidia.com/v1/chat/completions', api_key: '', model_id: 'meta/llama-3.1-70b-instruct', is_active: 1, is_default: 0 },
      { name: 'OpenRouter Claude 3.5 Sonnet', provider: 'openrouter', api_url: 'https://openrouter.ai/api/v1/chat/completions', api_key: '', model_id: 'anthropic/claude-3.5-sonnet', is_active: 1, is_default: 0 },
      { name: 'OpenRouter GPT-4', provider: 'openrouter', api_url: 'https://openrouter.ai/api/v1/chat/completions', api_key: '', model_id: 'openai/gpt-4', is_active: 1, is_default: 0 },
      { name: 'NaraRouter Mistral', provider: 'nararouter', api_url: 'https://nararouter.com/api/v1/chat/completions', api_key: '', model_id: 'mistral/mistral-large', is_active: 1, is_default: 0 }
    ];
    for (const m of defaultModels) {
      dbRun('INSERT INTO ai_models (id, name, provider, api_url, api_key, model_id, is_active, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), m.name, m.provider, m.api_url, m.api_key, m.model_id, m.is_active, m.is_default]);
    }
  }

  const userCount = dbGet('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    const hashed = bcrypt.hashSync('admin123', 10);
    dbRun('INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), 'admin', 'admin@loopix.ai', hashed, 'admin']);
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

async function callAIProvider(model, messages) {
  let apiUrl = model.api_url;
  if (!apiUrl.endsWith('/chat/completions')) {
    apiUrl = apiUrl.replace(/\/+$/, '') + '/chat/completions';
  }
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${model.api_key}`
    },
    body: JSON.stringify({
      model: model.model_id,
      messages: messages,
      stream: false
    })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error: ${response.status} - ${err}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

initDb().then(() => {

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const setting = dbGet("SELECT value FROM site_settings WHERE key = 'allow_registration'");
      if (setting && setting.value === 'false') return res.status(403).json({ error: 'Registration is disabled' });
      const existing = dbGet('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
      if (existing) return res.status(400).json({ error: 'Username or email already exists' });
      const hashed = bcrypt.hashSync(password, 10);
      const id = uuidv4();
      dbRun('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)', [id, username, email, hashed]);
      const token = jwt.sign({ id, username, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id, username, email, role: 'user', avatar: '' } });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      const user = dbGet('SELECT * FROM users WHERE email = ?', [email]);
      if (!user || !bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar } });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = dbGet('SELECT id, username, email, role, avatar, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(user);
  });

  app.put('/api/auth/profile', authenticateToken, (req, res) => {
    try {
      const { username, avatar } = req.body;
      if (username) dbRun('UPDATE users SET username = ?, updated_at = datetime(\'now\') WHERE id = ?', [username, req.user.id]);
      if (avatar !== undefined) dbRun('UPDATE users SET avatar = ?, updated_at = datetime(\'now\') WHERE id = ?', [avatar, req.user.id]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post('/api/auth/upload', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  app.get('/api/conversations', authenticateToken, (req, res) => {
    const convs = dbAll('SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC', [req.user.id]);
    res.json(convs);
  });

  app.post('/api/conversations', authenticateToken, (req, res) => {
    const { title, model } = req.body;
    const id = uuidv4();
    dbRun('INSERT INTO conversations (id, user_id, title, model) VALUES (?, ?, ?, ?)', [id, req.user.id, title || 'New Chat', model || 'gpt-3.5-turbo']);
    const conv = dbGet('SELECT * FROM conversations WHERE id = ?', [id]);
    res.json(conv);
  });

  app.delete('/api/conversations/:id', authenticateToken, (req, res) => {
    dbRun('DELETE FROM messages WHERE conversation_id = ?', [req.params.id]);
    dbRun('DELETE FROM conversations WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  });

  app.put('/api/conversations/:id', authenticateToken, (req, res) => {
    const { title } = req.body;
    dbRun('UPDATE conversations SET title = ?, updated_at = datetime(\'now\') WHERE id = ? AND user_id = ?', [title, req.params.id, req.user.id]);
    res.json({ success: true });
  });

  app.get('/api/conversations/:id/messages', authenticateToken, (req, res) => {
    const msgs = dbAll('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC', [req.params.id]);
    res.json(msgs);
  });

  app.post('/api/conversations/:id/messages', authenticateToken, async (req, res) => {
    try {
      const { content, model } = req.body;
      const conv = dbGet('SELECT * FROM conversations WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
      if (!conv) return res.status(404).json({ error: 'Conversation not found' });

      const userMsgId = uuidv4();
      dbRun('INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)', [userMsgId, req.params.id, 'user', content]);

      let modelRecord;
      if (model) {
        modelRecord = dbGet('SELECT * FROM ai_models WHERE id = ? AND is_active = 1', [model]);
      }
      if (!modelRecord) {
        modelRecord = dbGet('SELECT * FROM ai_models WHERE is_default = 1 AND is_active = 1');
      }
      if (!modelRecord) {
        const models = dbAll('SELECT * FROM ai_models WHERE is_active = 1 LIMIT 1');
        modelRecord = models[0];
      }
      if (!modelRecord) return res.status(400).json({ error: 'No active AI model found' });

      dbRun('UPDATE conversations SET model = ?, updated_at = datetime(\'now\') WHERE id = ?', [modelRecord.id, req.params.id]);

      const history = dbAll('SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC', [req.params.id]);
      const settingsRows = dbAll('SELECT key, value FROM site_settings');
      const settingsMap = {};
      for (const s of settingsRows) settingsMap[s.key] = s.value;

      const messagesForApi = [];
      if (settingsMap.system_prompt) {
        messagesForApi.push({ role: 'system', content: settingsMap.system_prompt });
      }
      for (const m of history) {
        messagesForApi.push({ role: m.role, content: m.content });
      }

      let aiResponse;
      if (modelRecord.provider === 'custom' || !modelRecord.api_key) {
        aiResponse = `[Demo Mode] This is a simulated response from ${modelRecord.name} (${modelRecord.provider}).\n\nConfigure your API key in Admin Panel > Models to get real responses.\n\nYour message was: "${content}"`;
      } else {
        try {
          aiResponse = await callAIProvider(modelRecord, messagesForApi);
        } catch (apiErr) {
          aiResponse = `[API Error] ${apiErr.message}\n\nPlease check your API key and model configuration in the Admin Panel.`;
        }
      }

      const aiMsgId = uuidv4();
      dbRun('INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)', [aiMsgId, req.params.id, 'assistant', aiResponse]);

      if (conv.title === 'New Chat' && content.length > 30) {
        const newTitle = content.substring(0, 50) + (content.length > 50 ? '...' : '');
        dbRun('UPDATE conversations SET title = ? WHERE id = ?', [newTitle, req.params.id]);
      }

      res.json({
        userMessage: { id: userMsgId, role: 'user', content },
        aiMessage: { id: aiMsgId, role: 'assistant', content: aiResponse, model: modelRecord }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/settings/public', (req, res) => {
    const settings = dbAll("SELECT key, value FROM site_settings WHERE key IN ('site_name', 'site_description', 'favicon_url', 'logo_url', 'primary_color', 'secondary_color', 'accent_color')");
    const result = {};
    for (const s of settings) result[s.key] = s.value;
    res.json(result);
  });

  app.get('/api/models/active', (req, res) => {
    const models = dbAll('SELECT id, name, provider, model_id FROM ai_models WHERE is_active = 1');
    res.json(models);
  });

  app.get('/api/admin/models', authenticateToken, requireAdmin, (req, res) => {
    const models = dbAll('SELECT * FROM ai_models ORDER BY created_at DESC');
    res.json(models);
  });

  app.post('/api/admin/models', authenticateToken, requireAdmin, (req, res) => {
    const { name, provider, api_url, api_key, model_id, is_active, is_default } = req.body;
    const id = uuidv4();
    dbRun('INSERT INTO ai_models (id, name, provider, api_url, api_key, model_id, is_active, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, provider, api_url, api_key || '', model_id, is_active ? 1 : 0, is_default ? 1 : 0]);
    if (is_default) dbRun('UPDATE ai_models SET is_default = 0 WHERE id != ?', [id]);
    res.json({ id, success: true });
  });

  app.put('/api/admin/models/:id', authenticateToken, requireAdmin, (req, res) => {
    const { name, provider, api_url, api_key, model_id, is_active, is_default } = req.body;
    const existing = dbGet('SELECT * FROM ai_models WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Model not found' });
    dbRun('UPDATE ai_models SET name=?, provider=?, api_url=?, api_key=?, model_id=?, is_active=?, is_default=? WHERE id=?',
      [name || existing.name, provider || existing.provider, api_url || existing.api_url,
       api_key !== undefined ? api_key : existing.api_key, model_id || existing.model_id,
       is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
       is_default ? 1 : 0, req.params.id]);
    if (is_default) dbRun('UPDATE ai_models SET is_default = 0 WHERE id != ?', [req.params.id]);
    res.json({ success: true });
  });

  app.delete('/api/admin/models/:id', authenticateToken, requireAdmin, (req, res) => {
    dbRun('DELETE FROM ai_models WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
    const users = dbAll('SELECT id, username, email, role, avatar, created_at, updated_at FROM users ORDER BY created_at DESC');
    res.json(users);
  });

  app.put('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
    const { username, email, role, password } = req.body;
    const user = dbGet('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (username) dbRun('UPDATE users SET username = ? WHERE id = ?', [username, req.params.id]);
    if (email) dbRun('UPDATE users SET email = ? WHERE id = ?', [email, req.params.id]);
    if (role) dbRun('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    if (password) {
      const hashed = bcrypt.hashSync(password, 10);
      dbRun('UPDATE users SET password = ? WHERE id = ?', [hashed, req.params.id]);
    }
    dbRun('UPDATE users SET updated_at = datetime(\'now\') WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    dbRun('DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = ?)', [req.params.id]);
    dbRun('DELETE FROM conversations WHERE user_id = ?', [req.params.id]);
    dbRun('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  app.get('/api/admin/settings', authenticateToken, requireAdmin, (req, res) => {
    const rows = dbAll('SELECT key, value FROM site_settings');
    const result = {};
    for (const s of rows) result[s.key] = s.value;
    res.json(result);
  });

  app.put('/api/admin/settings', authenticateToken, requireAdmin, (req, res) => {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      const existing = dbGet('SELECT id FROM site_settings WHERE key = ?', [key]);
      if (existing) {
        dbRun('UPDATE site_settings SET value = ? WHERE key = ?', [String(value), key]);
      } else {
        dbRun('INSERT INTO site_settings (key, value) VALUES (?, ?)', [key, String(value)]);
      }
    }
    res.json({ success: true });
  });

  app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
    const totalUsers = dbGet('SELECT COUNT(*) as count FROM users').count;
    const totalConvs = dbGet('SELECT COUNT(*) as count FROM conversations').count;
    const totalMsgs = dbGet('SELECT COUNT(*) as count FROM messages').count;
    const totalModels = dbGet('SELECT COUNT(*) as count FROM ai_models').count;
    res.json({ totalUsers, totalConvs, totalMsgs, totalModels });
  });

  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'client', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).json({ message: 'Loopix AI Server Running. Build client with: cd client && npm run build' });
    }
  });

  app.listen(PORT, () => {
    console.log(`Loopix AI server running on http://localhost:${PORT}`);
    console.log(`Admin login: admin@loopix.ai / admin123`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
