const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Import database functions
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3030;

// Admin password (ควรเปลี่ยนใน production)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'meeting-registration-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // ตั้งเป็น true ถ้าใช้ HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Middleware สำหรับตรวจสอบ authentication
function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Serve static files
app.use(express.static('.'));

// ป้องกันการเข้าถึง admin.html โดยตรง (ต้องล็อกอินก่อน)
app.get('/admin.html', (req, res, next) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin-login.html');
  }
  // ถ้าล็อกอินแล้ว ให้ serve ไฟล์ admin.html
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ฟังก์ชันแปลงวันที่เป็นภาษาไทย
function formatThaiDate(date) {
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} ${year} เวลา ${hours}:${minutes}`;
}

// POST: Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'กรุณากรอกรหัสผ่าน' });
  }

  if (password === ADMIN_PASSWORD) {
    req.session.isAuthenticated = true;
    req.session.loginTime = new Date().toISOString();
    res.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ' });
  } else {
    res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }
});

// POST: Admin Logout
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการออกจากระบบ' });
    }
    res.json({ success: true, message: 'ออกจากระบบสำเร็จ' });
  });
});

// GET: ตรวจสอบสถานะ authentication
app.get('/api/admin/check', (req, res) => {
  if (req.session && req.session.isAuthenticated) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

// GET: ดึงข้อมูลผู้ลงทะเบียนทั้งหมด
app.get('/api/participants', async (req, res) => {
  try {
    const participants = await db.getAllParticipants();
    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// POST: เพิ่มผู้ลงทะเบียนใหม่
app.post('/api/participants', async (req, res) => {
  try {
    const { fullName, method } = req.body;

    if (!fullName || !method) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // ตรวจสอบว่า method ถูกต้อง
    if (method !== 'in-person' && method !== 'zoom') {
      return res.status(400).json({ error: 'วิธีการเข้าร่วมไม่ถูกต้อง' });
    }

    const timestamp = new Date().toISOString();
    const id = Date.now().toString();

    const participant = await db.addParticipant(id, fullName, method, timestamp);
    res.status(201).json(participant);
  } catch (error) {
    console.error('Error adding participant:', error);
    if (error.message === 'ID already exists') {
      return res.status(409).json({ error: 'ID already exists' });
    }
    res.status(500).json({ error: 'Failed to add participant' });
  }
});

// PUT: แก้ไขข้อมูลผู้ลงทะเบียน (ต้อง authentication)
app.put('/api/participants/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, method } = req.body;

    if (!fullName || !method) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // ตรวจสอบว่า method ถูกต้อง
    if (method !== 'in-person' && method !== 'zoom') {
      return res.status(400).json({ error: 'วิธีการเข้าร่วมไม่ถูกต้อง' });
    }

    const participant = await db.updateParticipant(id, fullName, method);
    
    if (!participant) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ลงทะเบียน' });
    }

    res.json(participant);
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(500).json({ error: 'Failed to update participant' });
  }
});

// DELETE: ลบผู้ลงทะเบียน (ต้อง authentication)
app.delete('/api/participants/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteParticipant(id);

    if (!deleted) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ลงทะเบียน' });
    }

    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error deleting participant:', error);
    res.status(500).json({ error: 'Failed to delete participant' });
  }
});

// GET: สถิติผู้เข้าร่วม
app.get('/api/stats', async (req, res) => {
  try {
    const total = await db.getTotalCount();
    const inPerson = await db.getCountByMethod('in-person');
    const zoom = await db.getCountByMethod('zoom');

    res.json({
      total,
      inPerson,
      zoom
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET: ดึงข้อมูลการประชุม
app.get('/api/meeting-info', async (req, res) => {
  try {
    const meetingInfo = await db.getMeetingInfo();
    res.json(meetingInfo || { title: '', date: '', location: '', time: '' });
  } catch (error) {
    console.error('Error fetching meeting info:', error);
    res.status(500).json({ error: 'Failed to fetch meeting info' });
  }
});

// PUT: อัปเดตข้อมูลการประชุม (ต้อง authentication)
app.put('/api/meeting-info', requireAuth, async (req, res) => {
  try {
    const { title, date, location, time } = req.body;

    if (!title || !date || !location || !time) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const meetingInfo = await db.updateMeetingInfo(title, date, location, time);
    res.json(meetingInfo);
  } catch (error) {
    console.error('Error updating meeting info:', error);
    res.status(500).json({ error: 'Failed to update meeting info' });
  }
});

// เริ่มต้น server
app.listen(PORT, () => {
  console.log(`\n✅ Server is running on http://localhost:${PORT}`);
  console.log(`📄 Frontend: http://localhost:${PORT}`);
  console.log(`🔐 Admin: http://localhost:${PORT}/admin.html`);
  console.log(`🔑 Admin Password: ${ADMIN_PASSWORD}`);
  console.log(`💾 Database: SQLite (data/meeting-registration.db)\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await db.close();
  process.exit(0);
});
