const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// สร้างโฟลเดอร์ data ถ้ายังไม่มี
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// เปิดฐานข้อมูล
const dbPath = path.join(dataDir, 'meeting-registration.db');
let db = null;

// ฟังก์ชันสำหรับเปิดฐานข้อมูล (Promise-based)
function openDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase().then(resolve).catch(reject);
      }
    });
  });
}

// สร้างตารางถ้ายังไม่มี
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS participants (
          id TEXT PRIMARY KEY,
          fullName TEXT NOT NULL,
          method TEXT NOT NULL CHECK(method IN ('in-person', 'zoom')),
          timestamp TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      db.run(`
        CREATE INDEX IF NOT EXISTS idx_fullName ON participants(fullName)
      `, (err) => {
        if (err) reject(err);
      });

      db.run(`
        CREATE INDEX IF NOT EXISTS idx_method ON participants(method)
      `, (err) => {
        if (err) reject(err);
      });

      db.run(`
        CREATE INDEX IF NOT EXISTS idx_timestamp ON participants(timestamp)
      `, (err) => {
        if (err) reject(err);
      });

      // สร้างตาราง meeting_info สำหรับเก็บข้อมูลการประชุม
      db.run(`
        CREATE TABLE IF NOT EXISTS meeting_info (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          date TEXT NOT NULL,
          location TEXT NOT NULL,
          time TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      // ตรวจสอบว่ามีข้อมูลการประชุมหรือไม่ ถ้าไม่มีให้สร้างข้อมูลเริ่มต้น
      db.get('SELECT COUNT(*) as count FROM meeting_info', (err, row) => {
        if (err) {
          reject(err);
        } else if (row.count === 0) {
          // สร้างข้อมูลเริ่มต้น
          db.run(`
            INSERT INTO meeting_info (title, date, location, time)
            VALUES ('การประชุม', '', '', '')
          `, (err) => {
            if (err) {
              reject(err);
            } else {
              console.log('✅ Database initialized');
              resolve();
            }
          });
        } else {
          console.log('✅ Database initialized');
          resolve();
        }
      });
    });
  });
}

// ฟังก์ชันสำหรับจัดการข้อมูล (Promise-based)
const dbFunctions = {
  // ดึงข้อมูลทั้งหมด
  getAllParticipants() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM participants ORDER BY timestamp DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  // ดึงข้อมูลตาม ID
  getParticipantById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM participants WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  
  // เพิ่มผู้ลงทะเบียนใหม่
  addParticipant(id, fullName, method, timestamp) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO participants (id, fullName, method, timestamp) VALUES (?, ?, ?, ?)',
        [id, fullName, method, timestamp],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE')) {
              reject(new Error('ID already exists'));
            } else {
              reject(err);
            }
          } else {
            resolve({ id, fullName, method, timestamp });
          }
        }
      );
    });
  },
  
  // แก้ไขข้อมูล
  updateParticipant(id, fullName, method) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE participants SET fullName = ?, method = ? WHERE id = ?',
        [fullName, method, id],
        function(err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            resolve(null); // ไม่พบข้อมูล
          } else {
            // ดึงข้อมูลที่อัปเดตแล้ว
            dbFunctions.getParticipantById(id).then(resolve).catch(reject);
          }
        }
      );
    });
  },
  
  // ลบข้อมูล
  deleteParticipant(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM participants WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  },
  
  // ลบข้อมูลทั้งหมด
  deleteAllParticipants() {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM participants', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  
  // นับจำนวนทั้งหมด
  getTotalCount() {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM participants', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  },
  
  // นับตามวิธีการเข้าร่วม
  getCountByMethod(method) {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM participants WHERE method = ?', [method], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  },
  
  // ========== Meeting Info Functions ==========
  
  // ดึงข้อมูลการประชุม
  getMeetingInfo() {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM meeting_info ORDER BY id DESC LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  },
  
  // อัปเดตข้อมูลการประชุม
  updateMeetingInfo(title, date, location, time) {
    return new Promise((resolve, reject) => {
      // ตรวจสอบว่ามีข้อมูลหรือไม่
      db.get('SELECT COUNT(*) as count FROM meeting_info', (err, row) => {
        if (err) {
          reject(err);
        } else if (row.count === 0) {
          // ถ้ายังไม่มีข้อมูล ให้สร้างใหม่
          db.run(
            'INSERT INTO meeting_info (title, date, location, time) VALUES (?, ?, ?, ?)',
            [title, date, location, time],
            function(err) {
              if (err) reject(err);
              else {
                dbFunctions.getMeetingInfo().then(resolve).catch(reject);
              }
            }
          );
        } else {
          // อัปเดตข้อมูลที่มีอยู่
          db.run(
            'UPDATE meeting_info SET title = ?, date = ?, location = ?, time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM meeting_info ORDER BY id DESC LIMIT 1)',
            [title, date, location, time],
            function(err) {
              if (err) reject(err);
              else {
                dbFunctions.getMeetingInfo().then(resolve).catch(reject);
              }
            }
          );
        }
      });
    });
  },
  
  // ปิดการเชื่อมต่อฐานข้อมูล
  close() {
    return new Promise((resolve, reject) => {
      if (db) {
        db.close((err) => {
          if (err) reject(err);
          else {
            console.log('✅ Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
};

// เปิดฐานข้อมูลทันที
openDatabase().catch((err) => {
  console.error('❌ Error opening database:', err);
  process.exit(1);
});

// Export database instance และ functions
module.exports = {
  db,
  openDatabase,
  ...dbFunctions
};
