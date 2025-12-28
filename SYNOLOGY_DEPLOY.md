# 🚀 คู่มือ Deploy บน Synology NAS

คู่มือนี้จะช่วยคุณนำระบบลงทะเบียนเข้าร่วมประชุมไป deploy บน Synology NAS ของคุณ

---

## 📋 สิ่งที่ต้องเตรียม

1. ✅ Synology NAS ที่มี Docker Package ติดตั้งแล้ว
2. ✅ Google Sheets API credentials (ถ้าต้องการใช้ Google Sheets)
3. ✅ ไฟล์โปรเจ็กต์ทั้งหมด

---

## 🎯 วิธีที่ 1: ใช้ Docker GUI (แนะนำ - ง่ายที่สุด)

### ขั้นตอนที่ 1: เตรียมไฟล์

1. **อัปโหลดไฟล์ไปยัง Synology NAS**
   - สร้างโฟลเดอร์ใหม่ใน File Station เช่น `/docker/meeting-registration`
   - อัปโหลดไฟล์ทั้งหมดไปยังโฟลเดอร์นี้:
     - `package.json`
     - `server.js`
     - `index.html`
     - `admin.html`
     - `styles.css`
     - `admin.css`
     - `script.js`
     - `admin.js`
     - `Dockerfile`
     - `docker-compose.yml` (ถ้าใช้)
     - `credentials.json` (ถ้ามี)
     - `.env` (ถ้ามี)

### ขั้นตอนที่ 2: สร้าง Docker Image

1. เปิด **Docker** ใน Package Center
2. ไปที่ **Registry** → ค้นหา `node:18-alpine` → ดาวน์โหลด
3. ไปที่ **Image** → คลิก **Add** → **From File**
4. เลือก `Dockerfile` ที่อัปโหลดไว้
5. ตั้งชื่อ image เช่น `meeting-registration:latest`
6. คลิก **Build**

### ขั้นตอนที่ 3: สร้าง Container

1. ไปที่ **Container** → คลิก **Create**
2. เลือก image ที่สร้างไว้ (`meeting-registration:latest`)
3. ตั้งชื่อ container: `meeting-registration-app`
4. คลิก **Advanced Settings**

#### Network Settings:
- Enable **Auto Restart**
- Port Settings:
  - Container Port: `3030`
  - Local Port: `3030` (หรือ port อื่นที่ต้องการ)

#### Volume Settings:
- เพิ่ม volume:
  - File/Folder: `/docker/meeting-registration/credentials.json`
  - Mount path: `/app/credentials.json`
  - Read-only: ✅

#### Environment Variables:
เพิ่ม environment variables:
- `PORT=3030`
- `NODE_ENV=production`
- `SPREADSHEET_ID=your_spreadsheet_id` (ถ้ามี)
- `SHEET_NAME=Participants` (ถ้ามี)
- `GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json` (ถ้ามี)

5. คลิก **Apply** → **Next** → **Done**

### ขั้นตอนที่ 4: เริ่มต้น Container

1. เลือก container `meeting-registration-app`
2. คลิก **Start**
3. ตรวจสอบ logs ว่าทำงานถูกต้อง

### ขั้นตอนที่ 5: เข้าถึงระบบ

เปิดเบราว์เซอร์และไปที่:
- **หน้าแรก**: `http://your-nas-ip:3030`
- **หน้า Admin**: `http://your-nas-ip:3030/admin.html`

---

## 🎯 วิธีที่ 2: ใช้ Docker Compose (แนะนำสำหรับผู้ที่คุ้นเคย)

### ขั้นตอนที่ 1: เตรียมไฟล์

1. อัปโหลดไฟล์ทั้งหมดไปยัง `/docker/meeting-registration/`
2. สร้างไฟล์ `.env` (ถ้ายังไม่มี):
   ```env
   PORT=3030
   SPREADSHEET_ID=your_spreadsheet_id
   SHEET_NAME=Participants
   ```

### ขั้นตอนที่ 2: ใช้ Docker Compose

1. เปิด **SSH** ใน Synology NAS:
   - Control Panel → Terminal & SNMP → Enable SSH service
   
2. เชื่อมต่อผ่าน SSH:
   ```bash
   ssh admin@your-nas-ip
   ```

3. ไปที่โฟลเดอร์โปรเจ็กต์:
   ```bash
   cd /volume1/docker/meeting-registration
   ```

4. Build และรัน container:
   ```bash
   docker-compose up -d --build
   ```

5. ตรวจสอบสถานะ:
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

---

## 🎯 วิธีที่ 3: ใช้ Node.js Package (ไม่ใช้ Docker)

### ขั้นตอนที่ 1: ติดตั้ง Node.js

1. เปิด **Package Center**
2. ค้นหาและติดตั้ง **Node.js v18** (หรือเวอร์ชันที่รองรับ)

### ขั้นตอนที่ 2: เตรียมไฟล์

1. อัปโหลดไฟล์ทั้งหมดไปยัง `/docker/meeting-registration/`

### ขั้นตอนที่ 3: ตั้งค่า Task Scheduler

1. เปิด **Control Panel** → **Task Scheduler**
2. สร้าง **Scheduled Task** → **User-defined script**
3. ตั้งค่า:
   - **Task**: `Meeting Registration Server`
   - **User**: `root`
   - **Run**: `At startup`
   - **Script**:
     ```bash
     cd /volume1/docker/meeting-registration
     npm install
     npm start
     ```

### ขั้นตอนที่ 4: ใช้ PM2 (แนะนำ)

1. ติดตั้ง PM2 ผ่าน SSH:
   ```bash
   npm install -g pm2
   ```

2. สร้างไฟล์ `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'meeting-registration',
       script: 'server.js',
       cwd: '/volume1/docker/meeting-registration',
       instances: 1,
       exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3030
      },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
       merge_logs: true,
       autorestart: true,
       watch: false
     }]
   };
   ```

3. เริ่มต้นด้วย PM2:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

---

## 🔧 การตั้งค่า Reverse Proxy (แนะนำ)

เพื่อให้เข้าถึงผ่าน domain name แทน IP:port

### ขั้นตอนที่ 1: ตั้งค่า Reverse Proxy

1. เปิด **Control Panel** → **Login Portal** → **Advanced** → **Reverse Proxy**
2. คลิก **Create**
3. ตั้งค่า:
   - **Description**: `Meeting Registration`
   - **Source**:
     - Protocol: `HTTP` หรือ `HTTPS`
     - Hostname: `meeting.yourdomain.com` (หรือ domain ของคุณ)
     - Port: `80` (HTTP) หรือ `443` (HTTPS)
   - **Destination**:
     - Protocol: `HTTP`
     - Hostname: `localhost`
     - Port: `3030`
4. คลิก **Save**

### ขั้นตอนที่ 2: ตั้งค่า SSL Certificate (ถ้าใช้ HTTPS)

1. ไปที่ **Control Panel** → **Security** → **Certificate**
2. เพิ่ม certificate (Let's Encrypt หรือ certificate ของคุณเอง)
3. ใช้ certificate นี้ใน Reverse Proxy

---

## 🔒 Security Best Practices

### 1. เปลี่ยน Port (ถ้าต้องการ)

แก้ไขใน Docker container settings หรือ `.env`:
```env
PORT=3001
```

### 2. ใช้ Firewall

1. เปิด **Control Panel** → **Security** → **Firewall**
2. สร้าง rule:
   - Port: `3030` (หรือ port ที่คุณใช้)
   - Action: `Allow`
   - Source IP: (ระบุ IP ที่ต้องการ หรือ `All`)

### 3. ตั้งค่า Authentication (ถ้าต้องการ)

สามารถเพิ่ม authentication middleware ใน `server.js` สำหรับหน้า Admin

---

## 📊 Monitoring และ Logs

### ดู Logs

**Docker:**
```bash
docker logs meeting-registration-app -f
```

**Docker Compose:**
```bash
docker-compose logs -f
```

**PM2:**
```bash
pm2 logs meeting-registration
```

### ตรวจสอบสถานะ

**Docker:**
```bash
docker ps
docker stats meeting-registration-app
```

**PM2:**
```bash
pm2 status
pm2 monit
```

---

## 🔄 การอัปเดต

### วิธีที่ 1: Docker

1. อัปโหลดไฟล์ใหม่
2. Rebuild image:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

### วิธีที่ 2: PM2

1. อัปโหลดไฟล์ใหม่
2. Restart:
   ```bash
   pm2 restart meeting-registration
   ```

---

## 🛠️ การแก้ไขปัญหา

### Container ไม่เริ่มต้น

1. ตรวจสอบ logs:
   ```bash
   docker logs meeting-registration-app
   ```

2. ตรวจสอบ port ว่าถูกใช้งานหรือไม่:
   ```bash
   netstat -tuln | grep 3030
   ```

### ไม่สามารถเข้าถึงได้

1. ตรวจสอบ Firewall rules
2. ตรวจสอบ Reverse Proxy settings
3. ตรวจสอบว่า container กำลังรันอยู่

### ข้อมูลหาย

1. ตรวจสอบว่า Google Sheets credentials ถูกต้อง
2. ตรวจสอบว่า volume mount ถูกต้อง
3. ตรวจสอบ logs สำหรับ errors

---

## 📝 Checklist

- [ ] อัปโหลดไฟล์ทั้งหมดไปยัง NAS
- [ ] สร้าง Docker image
- [ ] ตั้งค่า container พร้อม volumes และ environment variables
- [ ] เริ่มต้น container
- [ ] ทดสอบเข้าถึงผ่าน IP:port
- [ ] ตั้งค่า Reverse Proxy (ถ้าต้องการ)
- [ ] ตั้งค่า SSL Certificate (ถ้าใช้ HTTPS)
- [ ] ตั้งค่า Firewall rules
- [ ] ทดสอบระบบทั้งหมด

---

## 🎯 ขั้นตอนต่อไป

1. ✅ Deploy สำเร็จ → ทดสอบระบบ
2. 🔒 ตั้งค่า Security → Firewall, SSL
3. 📊 ตั้งค่า Monitoring → Logs, Alerts
4. 🔄 ตั้งค่า Backup → Backup ข้อมูล Google Sheets

---

## 💡 Tips

- ใช้ **Docker Compose** สำหรับการจัดการที่ง่ายขึ้น
- ใช้ **PM2** สำหรับ production environment ที่เสถียร
- ตั้งค่า **Auto Restart** เพื่อให้ container เริ่มต้นใหม่อัตโนมัติเมื่อ NAS restart
- ใช้ **Reverse Proxy** เพื่อเข้าถึงผ่าน domain name
- ตั้งค่า **SSL Certificate** เพื่อความปลอดภัย

