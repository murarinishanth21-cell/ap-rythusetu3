import sqlite3Pkg from 'sqlite3';
const sqlite3 = sqlite3Pkg.verbose();
import path from 'path';
import os from 'os';

const dbPath = path.resolve(os.tmpdir(), 'rythusetu.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT,
    name TEXT,
    district TEXT,
    mobile TEXT,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id TEXT,
    farmer_name TEXT,
    district TEXT,
    crop TEXT,
    variety TEXT,
    qty INTEGER,
    price REAL,
    quality TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'Available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_id INTEGER,
    farmer_id TEXT,
    farmer_name TEXT,
    dealer_id TEXT,
    dealer_name TEXT,
    dealer_mobile TEXT,
    district TEXT,
    crop_name TEXT,
    requested_qty INTEGER,
    offered_price REAL,
    original_price REAL,
    message TEXT,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Drop old grievances table if outdated schema without user_id
  db.run(`CREATE TABLE IF NOT EXISTS grievances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    user_name TEXT,
    user_role TEXT DEFAULT 'farmer',
    district TEXT,
    description TEXT,
    translated_text TEXT,
    category TEXT DEFAULT 'General Dispute',
    admin_remark TEXT,
    status TEXT DEFAULT 'Open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Transport Logistics: Vehicles Fleet
  db.run(`CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_number TEXT UNIQUE,
    vehicle_type TEXT,
    district TEXT,
    capacity_quintals INTEGER,
    rate_per_km REAL,
    driver_name TEXT,
    driver_mobile TEXT,
    status TEXT DEFAULT 'Available',
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Transport Bookings
  db.run(`CREATE TABLE IF NOT EXISTS transport_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id TEXT UNIQUE,
    user_id TEXT,
    user_name TEXT,
    user_role TEXT DEFAULT 'farmer',
    user_mobile TEXT,
    district TEXT,
    vehicle_id INTEGER,
    vehicle_number TEXT,
    vehicle_type TEXT,
    driver_name TEXT,
    driver_mobile TEXT,
    pickup_location TEXT,
    drop_location TEXT,
    booking_date TEXT,
    booking_time TEXT,
    crop_name TEXT,
    crop_qty_quintals REAL,
    estimated_km REAL,
    estimated_fare REAL,
    otp TEXT,
    status TEXT DEFAULT 'Confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Check columns of enquiries table and add missing ones
  db.all("PRAGMA table_info(enquiries)", (err, columns) => {
    if (!err && columns) {
      const colNames = columns.map(c => c.name);
      if (!colNames.includes('original_price')) {
        db.run(`ALTER TABLE enquiries ADD COLUMN original_price REAL`);
      }
    }
  });

  // Check columns of grievances table and add missing ones if upgrading
  db.all("PRAGMA table_info(grievances)", (err, columns) => {
    if (!err && columns) {
      const colNames = columns.map(c => c.name);
      if (!colNames.includes('user_id')) {
        db.run(`ALTER TABLE grievances ADD COLUMN user_id TEXT`);
      }
      if (!colNames.includes('user_name')) {
        db.run(`ALTER TABLE grievances ADD COLUMN user_name TEXT`);
      }
      if (!colNames.includes('user_role')) {
        db.run(`ALTER TABLE grievances ADD COLUMN user_role TEXT DEFAULT 'farmer'`);
      }
      if (!colNames.includes('translated_text')) {
        db.run(`ALTER TABLE grievances ADD COLUMN translated_text TEXT`);
      }
      if (!colNames.includes('category')) {
        db.run(`ALTER TABLE grievances ADD COLUMN category TEXT DEFAULT 'General Dispute'`);
      }
      if (!colNames.includes('admin_remark')) {
        db.run(`ALTER TABLE grievances ADD COLUMN admin_remark TEXT`);
      }
    }
  });
  
  // Insert default admin if not exists
  db.get("SELECT id FROM users WHERE role = 'admin'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO users (id, role, name, password) VALUES ('admin', 'admin', 'AP Govt Admin Command Center', 'admin123')");
    }
  });

  // Seed default crops across top districts if none exist
  db.get("SELECT COUNT(*) as count FROM crops", (err, row) => {
    if (!row || row.count === 0) {
      const initialCrops = [
        ['AP-FRM-2026-1011', 'V. Ramana Rao', 'Guntur', 'Red Chilli (Teja Hot)', 'Grade-A Export', 26, 18500, 'Govt Inspected', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?q=80&w=400&auto=format&fit=crop'],
        ['AP-FRM-2026-1012', 'K. Subba Reddy', 'Guntur', 'Cotton (Kapas)', 'Long Staple High Micronaire', 38, 7400, 'Govt Inspected', '/images/crops/cotton.jpg'],
        ['AP-FRM-2026-1013', 'M. Venkatesh', 'Krishna', 'Black Gram (Urad Dal)', 'LBG-752 Bold Pods', 22, 8900, 'Govt Inspected', '/images/crops/black_gram.jpg'],
        ['AP-FRM-2026-1014', 'P. Chenna Kesava', 'Ananthapur', 'Groundnut (K-6 Bold)', 'Pod Dry 42% Oil', 42, 6800, 'Certified', '/images/crops/groundnut.jpg'],
        ['AP-FRM-2026-1015', 'G. Satyanarayana', 'Eluru', 'Oil Palm (Fresh Fruit Bunches)', 'Tenera Grade FFB', 55, 14200, 'Govt Inspected', '/images/crops/palm_oil.jpg'],
        ['AP-FRM-2026-1016', 'B. Koteswara Rao', 'Dr. B.R. Ambedkar Konaseema', 'Tender Coconut & Copra', 'Natural Fresh Ganga Bondam', 60, 2850, 'Certified', '/images/crops/coconut.jpg'],
        ['AP-FRM-2026-1017', 'V. Appala Naidu', 'Srikakulam', 'Cashew Nut (Raw In-Shell)', 'Vengurla-4 Premium', 28, 12800, 'Govt Inspected', '/images/crops/cashew_nuts.jpg'],
        ['AP-FRM-2026-1018', 'P. Prasad', 'Anakapalli', 'Jaggery (Bellam Lumps)', 'Pure Organic Chemical-Free Gold', 40, 4300, 'Govt Inspected', '/images/crops/jaggery.jpg'],
        ['AP-FRM-2026-1019', 'K. Suryanarayana', 'Duggirala / Guntur', 'Turmeric (Pasupu Fingers)', 'High Curcumin 5.2%', 30, 14200, 'Govt Inspected', '/images/crops/turmeric.jpg'],
        ['AP-FRM-2026-1020', 'R. Mohan', 'Chittoor', 'Sugarcane (Co-86032)', 'High Sugar Recovery 11.5%', 85, 340, 'Certified', '/images/crops/sugarcane.jpg']
      ];

      const stmt = db.prepare(`INSERT INTO crops (farmer_id, farmer_name, district, crop, variety, qty, price, quality, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const crop of initialCrops) {
        stmt.run(crop);
      }
      stmt.finalize();
    }
  });

  // Automatically update any existing records with exact local image paths
  db.run(`UPDATE crops SET image_url = '/images/crops/palm_oil.jpg' WHERE LOWER(crop) LIKE '%palm%' OR LOWER(crop) LIKE '%oil palm%'`);
  db.run(`UPDATE crops SET image_url = '/images/crops/cashew_nuts.jpg' WHERE LOWER(crop) LIKE '%cashew%' OR LOWER(crop) LIKE '%jeedi%'`);
  db.run(`UPDATE crops SET image_url = '/images/crops/black_gram.jpg' WHERE LOWER(crop) LIKE '%black gram%' OR LOWER(crop) LIKE '%urad%' OR LOWER(crop) LIKE '%minum%'`);
  db.run(`UPDATE crops SET image_url = '/images/crops/jaggery.jpg' WHERE LOWER(crop) LIKE '%jaggery%' OR LOWER(crop) LIKE '%bellam%'`);
  db.run(`UPDATE crops SET image_url = '/images/crops/coconut.jpg' WHERE LOWER(crop) LIKE '%coconut%' OR LOWER(crop) LIKE '%kobbari%'`);
  db.run(`UPDATE crops SET image_url = '/images/crops/cotton.jpg' WHERE LOWER(crop) LIKE '%cotton%' OR LOWER(crop) LIKE '%kapas%' OR LOWER(crop) LIKE '%pratti%'`);
  db.run(`UPDATE crops SET image_url = '/images/crops/turmeric.jpg' WHERE LOWER(crop) LIKE '%turmeric%' OR LOWER(crop) LIKE '%pasupu%'`);
  db.run(`UPDATE crops SET image_url = '/images/crops/groundnut.jpg' WHERE LOWER(crop) LIKE '%groundnut%' OR LOWER(crop) LIKE '%peanut%' OR LOWER(crop) LIKE '%verusenaga%'`);
  db.run(`UPDATE crops SET image_url = '/images/crops/sugarcane.jpg' WHERE LOWER(crop) LIKE '%sugarcane%' OR LOWER(crop) LIKE '%sugar cane%' OR LOWER(crop) LIKE '%cheruku%'`);

  // Seed sample initial voice complaints
  db.get("SELECT COUNT(*) as count FROM grievances", (err, row) => {
    if (!row || row.count === 0) {
      const initialComplaints = [
        [
          'AP-FRM-2026-1011',
          'V. Ramana Rao',
          'farmer',
          'Guntur',
          'గుంటూరు మార్కెట్ యార్డులో వ్యాపారి 15 రోజులైనా మిర్చి డబ్బులు చెల్లించలేదు. దయచేసి సహాయం చేయండి.',
          'Trader delayed payment for Red Chilli harvest past 15 days in Guntur Market Yard.',
          'Payment Delay',
          'Open'
        ],
        [
          'AP-FRM-2026-1014',
          'P. Chenna Kesava',
          'farmer',
          'Ananthapur',
          'వర్షాల వల్ల వేరుశనగ పంట దెబ్బతింది, ఆర్బీకే లో ఇన్సూరెన్స్ నమోదు కావడం లేదు.',
          'Groundnut crop damaged by heavy rainfall; facing issues with insurance registration at RBK center.',
          'Crop Damage & Insurance',
          'Under Investigation'
        ],
        [
          'AP-DLR-2026-3044',
          'Sri Balaji Agro Traders',
          'dealer',
          'Krishna',
          'కృష్ణా జిల్లాలో ధాన్యం రవాణాకు లారీల కొరత తీవ్రంగా ఉంది, రవాణా చార్జీలు అధికంగా వసూలు చేస్తున్నారు.',
          'Shortage of transport lorries for paddy dispatch in Krishna district; exorbitant freight rates being charged.',
          'Transport & Logistics',
          'Open'
        ]
      ];

      const stmt = db.prepare(`INSERT OR IGNORE INTO grievances (user_id, user_name, user_role, district, description, translated_text, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const comp of initialComplaints) {
        stmt.run(comp);
      }
      stmt.finalize();
    }
  });

  // Seed default transport agent user
  db.get("SELECT id FROM users WHERE role = 'transport'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO users (id, role, name, district, mobile, password) VALUES ('AP-TRP-2026-8801', 'transport', 'AP GreenLine Agro Logistics', 'Guntur', '9848099881', 'agent123')");
    }
  });

  // Seed vehicles fleet across 26 Andhra Pradesh districts
  db.get("SELECT COUNT(*) as count FROM vehicles", (err, row) => {
    if (!row || row.count === 0) {
      const initialVehicles = [
        // Guntur
        ['AP-07-TA-1044', 'Tata Ace (1.5 Ton)', 'Guntur', 15, 22, 'M. Sivaiah', '9848011221', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],
        ['AP-07-EC-2290', 'Eicher Pro 14ft (4 Ton)', 'Guntur', 40, 38, 'K. Venkat Rao', '9848022334', 'Available', 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=600&auto=format&fit=crop'],
        ['AP-07-AL-3310', 'Ashok Leyland Ecomet (9 Ton)', 'Guntur', 90, 62, 'Sk. Subhani', '9848033445', 'Available', 'https://images.unsplash.com/photo-1586191582056-a6f95dfb4a92?q=80&w=600&auto=format&fit=crop'],
        ['AP-07-TR-4455', 'Mahindra Tractor-Trailer (3 Ton)', 'Guntur', 30, 28, 'B. Sambasiva Rao', '9848044556', 'Available', 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?q=80&w=600&auto=format&fit=crop'],
        
        // Krishna
        ['AP-16-TA-5512', 'Tata Ace Gold (1.5 Ton)', 'Krishna', 15, 22, 'V. Nageswara Rao', '9848055667', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],
        ['AP-16-EC-6623', 'Eicher 19ft Heavy (7 Ton)', 'Krishna', 70, 52, 'Ch. Srinivasa Rao', '9848066778', 'Available', 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=600&auto=format&fit=crop'],
        ['AP-16-HD-7734', 'BharatBenz 10-Wheeler (16 Ton)', 'Krishna', 160, 95, 'P. Ramesh', '9848077889', 'Available', 'https://images.unsplash.com/photo-1586191582056-a6f95dfb4a92?q=80&w=600&auto=format&fit=crop'],

        // Prakasam
        ['AP-27-TA-8845', 'Tata Intra V30 (2 Ton)', 'Prakasam', 20, 25, 'G. Kondaiah', '9848088990', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],
        ['AP-27-EC-9956', 'Eicher Pro 17ft (5 Ton)', 'Prakasam', 50, 44, 'Y. Ramaiah', '9848099112', 'Available', 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=600&auto=format&fit=crop'],

        // Kurnool
        ['AP-21-TA-1122', 'Mahindra Bolero Maxi (2 Ton)', 'Kurnool', 20, 24, 'K. Hussain Peera', '9848111223', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],
        ['AP-21-AL-2233', 'Ashok Leyland 16-Ton Taurus', 'Kurnool', 160, 92, 'M. Basavaraj', '9848222334', 'Available', 'https://images.unsplash.com/photo-1586191582056-a6f95dfb4a92?q=80&w=600&auto=format&fit=crop'],
        ['AP-21-TR-3344', 'Sonalika Tractor Trolley (3.5 Ton)', 'Kurnool', 35, 30, 'R. Venkateswarlu', '9848333445', 'Available', 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?q=80&w=600&auto=format&fit=crop'],

        // East Godavari & West Godavari & Konaseema
        ['AP-05-TA-4455', 'Tata Ace HT (1.5 Ton)', 'East Godavari', 15, 22, 'B. Satyanarayana', '9848444556', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],
        ['AP-05-EC-5566', 'Eicher 14ft Canter (4 Ton)', 'East Godavari', 40, 38, 'T. Veerabhadra Rao', '9848555667', 'Available', 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=600&auto=format&fit=crop'],
        ['AP-37-TA-6677', 'Tata Ace (1.5 Ton)', 'West Godavari', 15, 22, 'P. Subba Raju', '9848666778', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],
        ['AP-38-AL-7788', 'Ashok Leyland Ecomet (8 Ton)', 'Dr. B.R. Ambedkar Konaseema', 80, 58, 'M. Rambabu', '9848777889', 'Available', 'https://images.unsplash.com/photo-1586191582056-a6f95dfb4a92?q=80&w=600&auto=format&fit=crop'],

        // Ananthapur & Sri Sathya Sai
        ['AP-02-TA-8899', 'Tata Ace Gold (1.5 Ton)', 'Ananthapur', 15, 23, 'S. Gangadhar', '9848888990', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],
        ['AP-02-EC-9900', 'Eicher Pro 17ft (6 Ton)', 'Ananthapur', 60, 48, 'B. Nagendra', '9848999001', 'Available', 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=600&auto=format&fit=crop'],
        ['AP-02-TR-1011', 'John Deere Tractor Trolley (4 Ton)', 'Sri Sathya Sai', 40, 32, 'G. Hanumantu', '9849000112', 'Available', 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?q=80&w=600&auto=format&fit=crop'],

        // Visakhapatnam & Anakapalli & Vizianagaram & Srikakulam
        ['AP-31-TA-1213', 'Tata Intra V50 (2 Ton)', 'Visakhapatnam', 20, 26, 'K. Jagannatham', '9849111223', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],
        ['AP-31-AL-1415', 'Ashok Leyland 14-Wheeler (22 Ton)', 'Visakhapatnam', 220, 115, 'D. Appa Rao', '9849222334', 'Available', 'https://images.unsplash.com/photo-1586191582056-a6f95dfb4a92?q=80&w=600&auto=format&fit=crop'],
        ['AP-34-TA-1617', 'Tata Ace (1.5 Ton)', 'Anakapalli', 15, 22, 'V. Chinna Rao', '9849333445', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],
        ['AP-35-EC-1819', 'Eicher Pro 14ft (4 Ton)', 'Vizianagaram', 40, 38, 'M. Suryanarayana', '9849444556', 'Available', 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=600&auto=format&fit=crop'],
        ['AP-30-TA-2021', 'Mahindra Bolero Pickup (1.7 Ton)', 'Srikakulam', 17, 23, 'P. Dhanunjaya', '9849555667', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],

        // Chittoor & Tirupati & Annamayya & Kadapa & Nellore
        ['AP-03-TA-2223', 'Tata Ace (1.5 Ton)', 'Chittoor', 15, 22, 'C. Muniswamy', '9849666778', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],
        ['AP-03-EC-2425', 'Eicher 17ft (5.5 Ton)', 'Tirupati', 55, 46, 'K. Murali Krishna', '9849777889', 'Available', 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=600&auto=format&fit=crop'],
        ['AP-39-TA-2627', 'Mahindra Pik-Up (2 Ton)', 'Annamayya', 20, 24, 'B. Chandra Sekhar', '9849888990', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],
        ['AP-04-AL-2829', 'Ashok Leyland Ecomet (9 Ton)', 'YSR Kadapa', 90, 60, 'S. Obulesu', '9849999001', 'Available', 'https://images.unsplash.com/photo-1586191582056-a6f95dfb4a92?q=80&w=600&auto=format&fit=crop'],
        ['AP-26-EC-3031', 'Eicher 19ft (7 Ton)', 'Sri Potti Sriramulu Nellore', 70, 50, 'N. Penchalaiah', '9850111223', 'Available', 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=600&auto=format&fit=crop'],

        // Palnadu & Bapatla & NTR & Nandyal & Eluru & Alluri & Parvathipuram
        ['AP-32-TA-3233', 'Tata Ace Gold (1.5 Ton)', 'Palnadu', 15, 22, 'G. Venkata Reddy', '9850222334', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],
        ['AP-33-TA-3435', 'Tata Intra V30 (2 Ton)', 'Bapatla', 20, 24, 'Ch. Koteswara Rao', '9850333445', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],
        ['AP-16-AL-3637', 'Ashok Leyland 16-Ton Taurus', 'NTR', 160, 94, 'K. Gopala Rao', '9850444556', 'Available', 'https://images.unsplash.com/photo-1586191582056-a6f95dfb4a92?q=80&w=600&auto=format&fit=crop'],
        ['AP-21-EC-3839', 'Eicher Pro 14ft (4 Ton)', 'Nandyal', 40, 38, 'M. Peddaiah', '9850555667', 'Available', 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=600&auto=format&fit=crop'],
        ['AP-37-AL-4041', 'Ashok Leyland (9 Ton)', 'Eluru', 90, 62, 'J. Rambabu', '9850666778', 'Available', 'https://images.unsplash.com/photo-1586191582056-a6f95dfb4a92?q=80&w=600&auto=format&fit=crop'],
        ['AP-36-TA-4243', 'Mahindra 4x4 Bolero Pickup (1.5 Ton)', 'Alluri Sitharama Raju', 15, 28, 'K. Somanna Dora', '9850777889', 'Available', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop'],
        ['AP-30-TR-4445', 'Swaraj Tractor Trailer (3 Ton)', 'Parvathipuram Manyam', 30, 28, 'T. Simhachalam', '9850888990', 'Available', 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?q=80&w=600&auto=format&fit=crop'],
        ['AP-05-AL-4647', 'BharatBenz Multi-Axle (20 Ton)', 'Kakinada', 200, 105, 'B. Satyanarayana Murthy', '9850999001', 'Available', 'https://images.unsplash.com/photo-1586191582056-a6f95dfb4a92?q=80&w=600&auto=format&fit=crop']
      ];

      const stmt = db.prepare(`INSERT INTO vehicles (vehicle_number, vehicle_type, district, capacity_quintals, rate_per_km, driver_name, driver_mobile, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const v of initialVehicles) {
        stmt.run(v);
      }
      stmt.finalize();
    }
  });

  // Seed sample initial transport booking
  db.get("SELECT COUNT(*) as count FROM transport_bookings", (err, row) => {
    if (!row || row.count === 0) {
      const sampleBookings = [
        [
          'TRP-2026-1011',
          'AP-FRM-2026-1011',
          'V. Ramana Rao',
          'farmer',
          '9848011111',
          'Guntur',
          1,
          'AP-07-TA-1044',
          'Tata Ace (1.5 Ton)',
          'M. Sivaiah',
          '9848011221',
          'Chebrolu Farm Yard, Guntur',
          'Guntur Mirchi Yard Gate-2',
          '2026-09-10',
          '08:30 AM',
          'Red Chilli (Teja Hot)',
          15,
          24,
          1150,
          '649201',
          'OTP Generated'
        ],
        [
          'TRP-2026-1012',
          'AP-DLR-2026-3044',
          'Sri Balaji Agro Traders',
          'dealer',
          '9848022222',
          'Krishna',
          6,
          'AP-16-EC-6623',
          'Eicher 19ft Heavy (7 Ton)',
          'Ch. Srinivasa Rao',
          '9848066778',
          'Gudivada Mandi Procurement Hub',
          'Machilipatnam Port Agro Warehouse',
          '2026-09-11',
          '10:00 AM',
          'Swarna Paddy (Rice)',
          65,
          48,
          2650,
          null,
          'Confirmed'
        ]
      ];

      const stmt = db.prepare(`INSERT OR IGNORE INTO transport_bookings (
        booking_id, user_id, user_name, user_role, user_mobile, district,
        vehicle_id, vehicle_number, vehicle_type, driver_name, driver_mobile,
        pickup_location, drop_location, booking_date, booking_time, crop_name,
        crop_qty_quintals, estimated_km, estimated_fare, otp, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      for (const b of sampleBookings) {
        stmt.run(b);
      }
      stmt.finalize();
    }
  });

  // Purge any prohibited crops
  db.run("DELETE FROM crops WHERE LOWER(crop) LIKE '%ganja%'");
});

export default db;
