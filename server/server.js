require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Initialize Gemini if API key is provided
let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// --- AUTH & USERS ---
app.post('/api/register', (req, res) => {
  const { role, name, district, mobile, password } = req.body;
  
  // Generate ID
  const prefix = role === 'farmer' ? 'AP-FRM' : 'AP-DLR';
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const id = `${prefix}-${year}-${randomNum}`;
  
  db.run(`INSERT INTO users (id, role, name, district, mobile, password) VALUES (?, ?, ?, ?, ?, ?)`, 
    [id, role, name, district, mobile, password], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, role, name, district });
  });
});

app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  if (id === 'admin' && password === 'admin123') {
    return res.json({ id: 'admin', role: 'admin', name: 'AP Govt Admin', district: 'Statewide' });
  }
  
  db.get(`SELECT id, role, name, district FROM users WHERE id = ? AND password = ?`, [id, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(row);
  });
});

// --- CROPS MARKETPLACE ---
app.post('/api/crops', (req, res) => {
  const { farmer_id, farmer_name, district, crop, variety, qty, price, quality, image_url } = req.body;
  
  db.run(`INSERT INTO crops (farmer_id, farmer_name, district, crop, variety, qty, price, quality, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [farmer_id, farmer_name, district, crop, variety, qty, price, quality, image_url || "https://images.unsplash.com/photo-1595188812674-d4f3b610c436?q=80&w=200&auto=format&fit=crop"], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
  });
});

app.get('/api/crops', (req, res) => {
  const { district } = req.query;
  let query = `SELECT * FROM crops WHERE status = 'Available'`;
  let params = [];
  if (district && district !== 'Statewide') {
    query += ` AND district = ?`;
    params.push(district);
  }
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/crops/farmer/:farmer_id', (req, res) => {
  db.all(`SELECT * FROM crops WHERE farmer_id = ?`, [req.params.farmer_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- GEMINI AI INTEGRATION ---
app.post('/api/ai/chat', async (req, res) => {
  const { message, lang } = req.body;
  if (!ai) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  
  try {
    const prompt = `
      You are Rythu Mitra, an AI assistant for Andhra Pradesh farmers.
      Analyze the following message and determine if it is a "Complaint" (e.g. delayed payment, bad dealer, transport issue) or a "Query" (e.g. weather, prices, farming advice).
      
      Respond STRICTLY with a JSON object in this format:
      {
        "intent": "Complaint" | "Query",
        "reply": "Your helpful response translated into ${lang === 'te' ? 'Telugu' : lang === 'hi' ? 'Hindi' : 'English'}."
      }
      
      User Message: "${message}"
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    const data = JSON.parse(response.text);
    
    // Auto-log grievance if it's a complaint
    if (data.intent === 'Complaint') {
      db.run(`INSERT INTO grievances (farmer_id, district, description) VALUES (?, ?, ?)`, ['Unknown', 'Auto-detected', message]);
    }
    
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI processing failed.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on port ${PORT}`));
