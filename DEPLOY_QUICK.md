# ⚡ Deploy บน Synology NAS - วิธีด่วน

## 🎯 วิธีที่ง่ายที่สุด (Docker GUI)

### 1. เตรียมไฟล์
- อัปโหลดไฟล์ทั้งหมดไปยัง `/docker/meeting-registration/` ใน File Station

### 2. สร้าง Container
1. เปิด **Docker** → **Container** → **Create**
2. เลือก **From Dockerfile**
3. เลือก `Dockerfile` ที่อัปโหลดไว้
4. ตั้งชื่อ: `meeting-registration-app`
5. **Advanced Settings**:
   - **Port**: `3030:3030`
   - **Volume**: `/docker/meeting-registration/credentials.json` → `/app/credentials.json` (read-only)
   - **Environment**:
     - `PORT=3030`
     - `SPREADSHEET_ID=your_id` (ถ้ามี)
     - `SHEET_NAME=Participants`
6. **Enable Auto Restart**
7. **Create** → **Start**

### 3. เข้าถึง
- `http://your-nas-ip:3030`

---

## 🚀 วิธีที่ 2 (Docker Compose - SSH)

```bash
# เชื่อมต่อ SSH
ssh admin@your-nas-ip

# ไปที่โฟลเดอร์
cd /volume1/docker/meeting-registration

# Deploy
docker-compose up -d --build

# ตรวจสอบ
docker-compose logs -f
```

---

## 📦 วิธีที่ 3 (PM2 - SSH)

```bash
# เชื่อมต่อ SSH
ssh admin@your-nas-ip

# ไปที่โฟลเดอร์
cd /volume1/docker/meeting-registration

# ติดตั้ง PM2
npm install -g pm2

# ติดตั้ง dependencies
npm install --production

# เริ่มต้น
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔧 ตั้งค่า Reverse Proxy (แนะนำ)

1. **Control Panel** → **Login Portal** → **Reverse Proxy**
2. **Create**:
   - Source: `meeting.yourdomain.com:443` (HTTPS)
   - Destination: `localhost:3030` (HTTP)
3. ใช้ SSL Certificate

---

## ✅ Checklist

- [ ] อัปโหลดไฟล์ทั้งหมด
- [ ] สร้าง container/รัน PM2
- [ ] ตั้งค่า environment variables
- [ ] Mount credentials.json (ถ้ามี)
- [ ] ทดสอบเข้าถึง
- [ ] ตั้งค่า Reverse Proxy (ถ้าต้องการ)

---

**ดูรายละเอียดเพิ่มเติม**: [SYNOLOGY_DEPLOY.md](./SYNOLOGY_DEPLOY.md)

