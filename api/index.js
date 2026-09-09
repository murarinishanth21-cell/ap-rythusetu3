import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
app.use(cors());
app.use(express.json());

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

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
  const prefix = role === 'farmer' ? 'AP-FRM' : role === 'dealer' ? 'AP-DLR' : 'AP-TRP';
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const id = `${prefix}-${year}-${randomNum}`;
  
  db.run(`INSERT INTO users (id, role, name, district, mobile, password) VALUES (?, ?, ?, ?, ?, ?)`, 
    [id, role, name, district || 'Guntur', mobile, password], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, role, name, district: district || 'Guntur', mobile });
  });
});

app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  if (id === 'admin' && password === 'admin123') {
    return res.json({ id: 'admin', role: 'admin', name: 'AP Govt Admin Command Center', district: 'Statewide' });
  }
  if ((id === 'agent' || id === 'transport' || id === 'AP-TRP-2026-8801') && (password === 'agent123' || password === 'admin123')) {
    return res.json({ id: 'AP-TRP-2026-8801', role: 'transport', name: 'AP GreenLine Agro Logistics', district: 'Guntur', mobile: '9848099881' });
  }
  
  db.get(`SELECT id, role, name, district, mobile FROM users WHERE id = ? AND password = ?`, [id, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Invalid credentials. Please check your ID and password.' });
    res.json(row);
  });
});

// --- CROPS MARKETPLACE ---
app.post('/api/crops', (req, res) => {
  const { farmer_id, farmer_name, district, crop, variety, qty, price, quality, image_url } = req.body;
  
  db.run(`INSERT INTO crops (farmer_id, farmer_name, district, crop, variety, qty, price, quality, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [farmer_id, farmer_name, district, crop, variety || 'Standard', qty, price, quality || 'Farmer Certified', image_url || "https://images.unsplash.com/photo-1595188812674-d4f3b610c436?q=80&w=400&auto=format&fit=crop"], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
  });
});

app.get('/api/crops', (req, res) => {
  const { district } = req.query;
  let query = `SELECT * FROM crops WHERE status = 'Available'`;
  let params = [];
  if (district && district !== 'Statewide' && district !== 'All') {
    query += ` AND LOWER(district) = LOWER(?)`;
    params.push(district);
  }
  query += ` ORDER BY id DESC`;
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/crops/farmer/:farmer_id', (req, res) => {
  db.all(`SELECT * FROM crops WHERE farmer_id = ? ORDER BY id DESC`, [req.params.farmer_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- ENQUIRIES & DEALS ---
app.post('/api/enquiries', (req, res) => {
  const { 
    crop_id, farmer_id, farmer_name, dealer_id, dealer_name, 
    dealer_mobile, district, crop_name, requested_qty, offered_price, original_price, message 
  } = req.body;

  db.run(`INSERT INTO enquiries (
    crop_id, farmer_id, farmer_name, dealer_id, dealer_name, 
    dealer_mobile, district, crop_name, requested_qty, offered_price, original_price, message
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    crop_id, farmer_id, farmer_name, dealer_id, dealer_name,
    dealer_mobile, district, crop_name, requested_qty, offered_price, original_price || offered_price, message
  ], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, enquiry_id: this.lastID });
  });
});

app.get('/api/enquiries/farmer/:farmer_id', (req, res) => {
  db.all(`SELECT * FROM enquiries WHERE farmer_id = ? ORDER BY id DESC`, [req.params.farmer_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/enquiries/dealer/:dealer_id', (req, res) => {
  db.all(`SELECT * FROM enquiries WHERE dealer_id = ? ORDER BY id DESC`, [req.params.dealer_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.patch('/api/enquiries/:id/status', (req, res) => {
  const { status } = req.body; // 'Accepted' | 'Declined'
  db.run(`UPDATE enquiries SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updated: this.changes });
  });
});

// --- TRANSPORT & LOGISTICS FLEET ---
app.get('/api/transport/vehicles', (req, res) => {
  const { district, status } = req.query;
  let query = `SELECT * FROM vehicles WHERE 1=1`;
  let params = [];
  
  if (district && district !== 'Statewide' && district !== 'All') {
    query += ` AND LOWER(district) = LOWER(?)`;
    params.push(district);
  }
  if (status && status !== 'All') {
    query += ` AND status = ?`;
    params.push(status);
  }
  query += ` ORDER BY status ASC, id ASC`;

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Also get counts for this scope
    let countQuery = `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available,
      SUM(CASE WHEN status = 'On Trip' THEN 1 ELSE 0 END) as on_trip,
      SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) as maintenance
      FROM vehicles WHERE 1=1`;
    let countParams = [];
    if (district && district !== 'Statewide' && district !== 'All') {
      countQuery += ` AND LOWER(district) = LOWER(?)`;
      countParams.push(district);
    }

    db.get(countQuery, countParams, (err2, stats) => {
      res.json({
        vehicles: rows,
        stats: stats || { total: rows.length, available: rows.filter(r => r.status === 'Available').length, on_trip: 0, maintenance: 0 }
      });
    });
  });
});

app.get('/api/transport/stats', (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM vehicles) as total_vehicles,
      (SELECT COUNT(*) FROM vehicles WHERE status = 'Available') as available_vehicles,
      (SELECT COUNT(*) FROM transport_bookings WHERE status != 'Completed' AND status != 'Cancelled') as active_bookings,
      (SELECT COUNT(*) FROM transport_bookings WHERE status = 'Completed') as completed_trips
  `;
  
  db.get(query, [], (err, overall) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.all(`SELECT district, 
      COUNT(*) as total, 
      SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available 
      FROM vehicles GROUP BY district`, [], (err2, districtBreakdown) => {
      res.json({
        ...overall,
        district_breakdown: districtBreakdown || []
      });
    });
  });
});

app.post('/api/transport/book', (req, res) => {
  const {
    user_id, user_name, user_role, user_mobile, district,
    vehicle_id, vehicle_number, vehicle_type, driver_name, driver_mobile,
    pickup_location, drop_location, booking_date, booking_time,
    crop_name, crop_qty_quintals, estimated_km, estimated_fare
  } = req.body;

  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const booking_id = `TRP-${year}-${randomNum}`;

  db.run(`INSERT INTO transport_bookings (
    booking_id, user_id, user_name, user_role, user_mobile, district,
    vehicle_id, vehicle_number, vehicle_type, driver_name, driver_mobile,
    pickup_location, drop_location, booking_date, booking_time,
    crop_name, crop_qty_quintals, estimated_km, estimated_fare, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')`,
  [
    booking_id, user_id || 'AP-USER-DEMO', user_name || 'Agri User', user_role || 'farmer', user_mobile || '9848011222', district || 'Guntur',
    vehicle_id, vehicle_number, vehicle_type, driver_name, driver_mobile,
    pickup_location, drop_location, booking_date || new Date().toISOString().split('T')[0], booking_time || '09:00 AM',
    crop_name || 'Agricultural Produce', crop_qty_quintals || 10, estimated_km || 25, estimated_fare || 1000
  ], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Update vehicle status to On Trip
    if (vehicle_id) {
      db.run(`UPDATE vehicles SET status = 'On Trip' WHERE id = ?`, [vehicle_id]);
    }
    
    res.json({ success: true, id: this.lastID, booking_id });
  });
});

app.get('/api/transport/bookings/user/:user_id', (req, res) => {
  db.all(`SELECT * FROM transport_bookings WHERE user_id = ? ORDER BY id DESC`, [req.params.user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/transport/bookings', (req, res) => {
  const { district, status } = req.query;
  let query = `SELECT * FROM transport_bookings WHERE 1=1`;
  let params = [];
  
  if (district && district !== 'Statewide' && district !== 'All') {
    query += ` AND LOWER(district) = LOWER(?)`;
    params.push(district);
  }
  if (status && status !== 'All') {
    query += ` AND status = ?`;
    params.push(status);
  }
  query += ` ORDER BY id DESC`;

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/transport/bookings/:id/generate-otp', (req, res) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  db.run(`UPDATE transport_bookings SET otp = ?, status = 'OTP Generated' WHERE id = ?`, [otp, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, otp, status: 'OTP Generated' });
  });
});

app.patch('/api/transport/bookings/:id/status', (req, res) => {
  const { status } = req.body; // 'Confirmed' | 'OTP Generated' | 'In-Transit' | 'Completed' | 'Cancelled'
  
  db.run(`UPDATE transport_bookings SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    // If completed or cancelled, free up the vehicle
    if (status === 'Completed' || status === 'Cancelled') {
      db.get(`SELECT vehicle_id FROM transport_bookings WHERE id = ?`, [req.params.id], (err2, row) => {
        if (row && row.vehicle_id) {
          db.run(`UPDATE vehicles SET status = 'Available' WHERE id = ?`, [row.vehicle_id]);
        }
      });
    } else if (status === 'In-Transit') {
      db.get(`SELECT vehicle_id FROM transport_bookings WHERE id = ?`, [req.params.id], (err2, row) => {
        if (row && row.vehicle_id) {
          db.run(`UPDATE vehicles SET status = 'On Trip' WHERE id = ?`, [row.vehicle_id]);
        }
      });
    }

    res.json({ success: true, updated: this.changes });
  });
});

app.patch('/api/transport/vehicles/:id/status', (req, res) => {
  const { status } = req.body; // 'Available' | 'Maintenance' | 'On Trip'
  db.run(`UPDATE vehicles SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updated: this.changes });
  });
});

// --- GRIEVANCES & COMPLAINTS (ADMIN & USER PORTAL) ---
app.get('/api/grievances', (req, res) => {
  const { district, status, role } = req.query;
  let query = `SELECT * FROM grievances WHERE 1=1`;
  let params = [];
  
  if (district && district !== 'Statewide' && district !== 'All') {
    query += ` AND LOWER(district) = LOWER(?)`;
    params.push(district);
  }
  if (status && status !== 'All') {
    query += ` AND status = ?`;
    params.push(status);
  }
  if (role && role !== 'All') {
    query += ` AND user_role = ?`;
    params.push(role);
  }
  query += ` ORDER BY id DESC`;

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/grievances/user/:user_id', (req, res) => {
  db.all(`SELECT * FROM grievances WHERE user_id = ? ORDER BY id DESC`, [req.params.user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/grievances', (req, res) => {
  const { user_id, user_name, user_role, district, description, translated_text, category } = req.body;
  db.run(`INSERT INTO grievances (user_id, user_name, user_role, district, description, translated_text, category, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Open')`,
    [user_id || 'AP-USER', user_name || 'Anonymous', user_role || 'farmer', district || 'Guntur', description, translated_text || description, category || 'General Complaint'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
  });
});

app.patch('/api/grievances/:id/status', (req, res) => {
  const { status, admin_remark } = req.body;
  db.run(`UPDATE grievances SET status = ?, admin_remark = ? WHERE id = ?`, 
    [status, admin_remark || null, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, updated: this.changes });
  });
});

// --- GEMINI AI INTEGRATION (WITH SMART GRIEVANCE VOICE LOGGING) ---
app.post('/api/ai/chat', async (req, res) => {
  const { message, lang, user_id, user_name, user_role, district } = req.body;
  
  // Keyword-based fallback detector
  const complaintKeywords = [
    'complaint', 'fraud', 'cheat', 'delay', 'not paid', 'money', 'payment', 
    'damage', 'issue', 'problem', 'corrupt', 'loss', 'water', 'rate', 'price',
    'weigh', 'weighing', 'truck', 'lorry', 'transport', 'driver', 'dispute', 'unfair', 'penalty',
    'ఫిర్యాదు', 'మోసం', 'డబ్బులు', 'నష్టం', 'చెల్లించలేదు', 'సమస్య', 'లంచం', 'కల్తీ',
    'ధర', 'తూకం', 'తేడా', 'రవాణా', 'లారీ', 'డ్రైవర్', 'ఆలస్యం', 'చెల్లింపు', 'అన్యాయం',
    'शिकायत', 'धोखा', 'पैसा', 'नुकसान', 'भुगतान', 'समस्या', 'रिश्वत', 'तौल', 'दाम', 'ड्राइवर'
  ];

  const lowerMsg = (message || '').toLowerCase();
  const isKeywordComplaint = complaintKeywords.some(kw => lowerMsg.includes(kw));

  if (!ai) {
    // Intelligent Fallback when Gemini API key is not provided in environment
    if (isKeywordComplaint) {
      const category = lowerMsg.includes('payment') || lowerMsg.includes('డబ్బులు') || lowerMsg.includes('paid') 
        ? 'Payment Delay' 
        : lowerMsg.includes('damage') || lowerMsg.includes('నష్టం') 
        ? 'Crop Damage' 
        : 'Mandi & Trade Dispute';

      db.run(`INSERT INTO grievances (user_id, user_name, user_role, district, description, translated_text, category, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Open')`,
        [
          user_id || 'AP-FRM-VOICE', 
          user_name || 'Farmer', 
          user_role || 'farmer', 
          district || 'Guntur', 
          message, 
          `Voice Grievance reported in ${district || 'Guntur'}: ${message}`, 
          category
        ], function(err) {
          const ticketId = this?.lastID || 'AP-GRV-' + Math.floor(1000 + Math.random()*9000);
          const reply = lang === 'te' 
            ? `✅ మీ ఫిర్యాదు నమోదు చేయబడింది (టికెట్ #${ticketId}). AP వ్యవసాయ శాఖ కమాండ్ సెంటర్ త్వరలో చర్య తీసుకుంటుంది.` 
            : lang === 'hi'
            ? `✅ आपकी शिकायत दर्ज कर ली गई है (टिकट #${ticketId})। कृषि विभाग जल्द संपर्क करेगा।`
            : `✅ Your complaint has been officially logged (Ticket #${ticketId}) and routed to the AP Agriculture Department Command Center.`;
          
          res.json({ intent: 'Complaint', category, ticketId, reply });
      });
      return;
    }

    const defaultReply = lang === 'te' 
      ? `రైతు సేతు సహాయ కేంద్రం: మీ ప్రశ్నకు ధన్యవాదాలు. నేడు మార్కెట్లో ధరలు స్థిరంగా ఉన్నాయి.` 
      : lang === 'hi'
      ? `किसान सेतु में आपका स्वागत है। आज मंडी भाव स्थिर हैं।`
      : `Rythu Setu Advisory: Market rates are stable today across Andhra Pradesh mandis.`;
    
    return res.json({ intent: 'Query', reply: defaultReply });
  }
  
  try {
    const prompt = `
      You are Rythu Mitra, an AI Voice Assistant for Andhra Pradesh farmers and agricultural dealers.
      Analyze the user message.
      Determine if it is a "Complaint" (e.g. delayed payment, cheating by dealer, high transport charge, damaged crop, mandi malpractice) or a "Query" (e.g. weather, seed recommendation, current mandi prices, farming advice).

      Respond STRICTLY with a JSON object in this format:
      {
        "intent": "Complaint" | "Query",
        "category": "Payment Delay" | "Mandi Trade Dispute" | "Crop Damage & Insurance" | "Transport & Logistics" | "Quality & Testing" | "General Query",
        "english_summary": "One sentence summary in English of the issue",
        "reply": "Empathetic, clear response translated into ${lang === 'te' ? 'Telugu' : lang === 'hi' ? 'Hindi' : 'English'}. If it is a complaint, confirm that it has been officially logged with the AP Agriculture Department Command Center."
      }
      
      User Message: "${message}"
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    const data = JSON.parse(response.text);
    
    // Auto-log grievance if it's classified as a complaint
    if (data.intent === 'Complaint') {
      db.run(`INSERT INTO grievances (user_id, user_name, user_role, district, description, translated_text, category, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Open')`,
        [
          user_id || 'AP-VOICE-USER', 
          user_name || 'Farmer / Dealer', 
          user_role || 'farmer', 
          district || 'Guntur', 
          message, 
          data.english_summary || message, 
          data.category || 'General Complaint'
        ], function(err) {
          const ticketId = this?.lastID;
          res.json({ ...data, ticketId });
      });
    } else {
      res.json(data);
    }
    
  } catch (error) {
    console.error("AI Error:", error);
    res.json({ 
      intent: isKeywordComplaint ? 'Complaint' : 'Query', 
      reply: lang === 'te' 
        ? "మీ అభ్యర్థన నమోదు చేయబడింది. మార్కెట్ వివరాలు త్వరలో అందుబాటులోకి వస్తాయి." 
        : "Your voice message was processed and recorded." 
    });
  }
// SPA Fallback for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ status: 'API Online', message: 'Rythu Setu Backend Running' });
  }
});

const PORT = process.env.PORT || 8080;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Rythu Setu API Server running on port ${PORT}`);
  });
}

export default app;

