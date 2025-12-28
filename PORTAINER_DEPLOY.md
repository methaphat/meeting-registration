# 🐳 คู่มือ Deploy ผ่าน Portainer บน Synology NAS

คู่มือนี้จะช่วยคุณนำระบบลงทะเบียนเข้าร่วมประชุมไป deploy ผ่าน Portainer บน Synology NAS

---

## 📋 สิ่งที่ต้องเตรียม

1. ✅ Synology NAS ที่มี Docker Package ติดตั้งแล้ว
2. ✅ Portainer ติดตั้งและรันอยู่แล้ว
3. ✅ ไฟล์โปรเจ็กต์ทั้งหมด

---

## 🎯 วิธีที่ 1: ใช้ Docker Compose (แนะนำ)

### ขั้นตอนที่ 1: เตรียมไฟล์

1. **อัปโหลดไฟล์ไปยัง Synology NAS**
   - สร้างโฟลเดอร์ใหม่ใน File Station เช่น `/docker/meeting-registration`
   - อัปโหลดไฟล์ทั้งหมดไปยังโฟลเดอร์นี้:
     - `Dockerfile`
     - `docker-compose.yml`
     - `package.json`
     - `server.js`
     - `database.js`
     - `index.html`
     - `admin.html`
     - `admin-login.html`
     - `styles.css`
     - `admin.css`
     - `script.js`
     - `admin.js`
     - `.env` (ถ้ามี - สร้างจาก `env.example`)

### ขั้นตอนที่ 2: เปิด Portainer

1. เปิด **Portainer** ในเบราว์เซอร์ (ปกติจะอยู่ที่ `http://your-nas-ip:9000`)
2. Login เข้าสู่ระบบ

### ขั้นตอนที่ 3: สร้าง Stack

1. ไปที่ **Stacks** ในเมนูด้านซ้าย
2. คลิก **Add stack**
3. ตั้งชื่อ stack: `meeting-registration`
4. เลือก **Web editor** หรือ **Upload**

#### ถ้าเลือก Web editor:
- คัดลอกเนื้อหาจาก `docker-compose.yml` วางใน editor

#### ถ้าเลือก Upload:
- อัปโหลดไฟล์ `docker-compose.yml`

5. คลิก **Deploy the stack**

### ขั้นตอนที่ 4: ตรวจสอบ

1. ไปที่ **Stacks** → `meeting-registration`
2. ตรวจสอบว่า container รันอยู่
3. ดู Logs เพื่อตรวจสอบว่าไม่มี error

---

## 🎯 วิธีที่ 2: ใช้ Docker Compose ผ่าน Portainer File Browser

### ขั้นตอนที่ 1: อัปโหลดไฟล์

1. อัปโหลดไฟล์ทั้งหมดไปยัง `/docker/meeting-registration/`

### ขั้นตอนที่ 2: ใช้ Portainer File Browser

1. เปิด Portainer
2. ไปที่ **Volumes** → สร้าง volume ใหม่ (ถ้าต้องการ)
3. ไปที่ **Stacks** → **Add stack**
4. เลือก **Repository** → **Git repository** หรือ **Upload**
5. อัปโหลด `docker-compose.yml`

---

## 🎯 วิธีที่ 3: ใช้ Portainer App Templates (ถ้ามี)

1. ไปที่ **App Templates** ใน Portainer
2. คลิก **Add template**
3. ใช้ template ต่อไปนี้:

```json
{
  "type": 1,
  "title": "Meeting Registration System",
  "description": "ระบบลงทะเบียนเข้าร่วมประชุม",
  "note": "ระบบลงทะเบียนเข้าร่วมประชุมพร้อม SQLite database",
  "categories": ["database", "web"],
  "platform": "linux",
  "logo": "https://raw.githubusercontent.com/portainer/portainer/master/app/templates/images/docker.png",
  "repository": {
    "url": "",
    "stackfile": "docker-compose.yml"
  },
  "env": [
    {
      "name": "PORT",
      "label": "Port",
      "default": "3030"
    },
    {
      "name": "ADMIN_PASSWORD",
      "label": "Admin Password",
      "default": "admin123"
    }
  ]
}
```

---

## ⚙️ การตั้งค่า Environment Variables

### ผ่าน Portainer UI:

1. ไปที่ **Stacks** → `meeting-registration` → **Editor**
2. แก้ไข `docker-compose.yml` ในส่วน `environment`:

```yaml
environment:
  - PORT=3030
  - ADMIN_PASSWORD=your_secure_password
  - SESSION_SECRET=your_session_secret
```

3. คลิก **Update the stack**

### ผ่าน .env file:

1. สร้างไฟล์ `.env` ในโฟลเดอร์ `/docker/meeting-registration/`:

```env
PORT=3030
ADMIN_PASSWORD=your_secure_password
SESSION_SECRET=your_session_secret
```

2. Mount `.env` file ใน `docker-compose.yml`:

```yaml
volumes:
  - ./.env:/app/.env:ro
```

---

## 📁 Volumes และ Data Persistence

### ข้อมูลที่ต้องเก็บ:

1. **SQLite Database** (`data/meeting-registration.db`)
   - Mount: `./data:/app/data`
   - ข้อมูลผู้ลงทะเบียนจะถูกเก็บใน volume นี้

2. **Environment Variables** (optional)
   - Mount: `./.env:/app/.env:ro`

### สร้าง Named Volume (แนะนำ):

1. ไปที่ **Volumes** ใน Portainer
2. คลิก **Add volume**
3. ตั้งชื่อ: `meeting-registration-data`
4. แก้ไข `docker-compose.yml`:

```yaml
volumes:
  meeting-data:
    external: true
    name: meeting-registration-data
```

---

## 🔧 การอัปเดต

### วิธีที่ 1: ผ่าน Portainer UI

1. ไปที่ **Stacks** → `meeting-registration`
2. คลิก **Editor**
3. แก้ไข `docker-compose.yml` หรืออัปโหลดไฟล์ใหม่
4. คลิก **Update the stack**

### วิธีที่ 2: Rebuild Image

1. ไปที่ **Images** ใน Portainer
2. คลิก **Build a new image**
3. ตั้งค่า:
   - **Name**: `meeting-registration:latest`
   - **Build method**: **Upload**
   - อัปโหลด `Dockerfile` และไฟล์ที่จำเป็น
4. หลังจาก build สำเร็จ → **Stacks** → **Editor** → **Update**

---

## 🌐 การตั้งค่า Reverse Proxy

### ผ่าน Synology Reverse Proxy:

1. เปิด **Control Panel** → **Login Portal** → **Reverse Proxy**
2. คลิก **Create**
3. ตั้งค่า:
   - **Source**: `meeting.yourdomain.com:443` (HTTPS)
   - **Destination**: `localhost:3030` (HTTP)
4. ใช้ SSL Certificate

### ผ่าน Portainer (ถ้าใช้ Traefik):

เพิ่ม labels ใน `docker-compose.yml`:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.meeting.rule=Host(`meeting.yourdomain.com`)"
  - "traefik.http.routers.meeting.entrypoints=websecure"
  - "traefik.http.routers.meeting.tls.certresolver=letsencrypt"
```

---

## 📊 Monitoring และ Logs

### ดู Logs:

1. ไปที่ **Stacks** → `meeting-registration`
2. คลิกที่ container name
3. ไปที่แท็บ **Logs**

### ดู Statistics:

1. ไปที่ **Stacks** → `meeting-registration`
2. คลิกที่ container name
3. ไปที่แท็บ **Stats**

---

## 🔒 Security Best Practices

### 1. เปลี่ยนรหัสผ่าน Admin

แก้ไขใน `.env` หรือ Portainer environment variables:
```env
ADMIN_PASSWORD=your_strong_password_here
```

### 2. เปลี่ยน Session Secret

```env
SESSION_SECRET=your_random_secret_key_here
```

### 3. ใช้ HTTPS

ตั้งค่า Reverse Proxy พร้อม SSL Certificate

### 4. Firewall Rules

- เปิด port 3030 เฉพาะ IP ที่ต้องการ (ถ้าไม่ใช้ Reverse Proxy)
- หรือใช้ Reverse Proxy และเปิดเฉพาะ port 80/443

---

## 🛠️ การแก้ไขปัญหา

### Container ไม่เริ่มต้น

1. ตรวจสอบ Logs ใน Portainer
2. ตรวจสอบว่า port 3030 ไม่ถูกใช้งาน
3. ตรวจสอบว่า volumes mount ถูกต้อง

### ไม่สามารถเข้าถึงได้

1. ตรวจสอบว่า container รันอยู่
2. ตรวจสอบ port mapping
3. ตรวจสอบ firewall rules

### ข้อมูลหาย

1. ตรวจสอบว่า volume mount ถูกต้อง
2. ตรวจสอบ permissions ของ volume
3. ตรวจสอบ logs สำหรับ database errors

---

## 📝 Checklist

- [ ] อัปโหลดไฟล์ทั้งหมดไปยัง NAS
- [ ] สร้าง `.env` file (optional)
- [ ] สร้าง Stack ใน Portainer
- [ ] ตั้งค่า environment variables
- [ ] ตั้งค่า volumes สำหรับ data persistence
- [ ] Deploy stack
- [ ] ตรวจสอบ logs
- [ ] ทดสอบเข้าถึงผ่าน IP:port
- [ ] ตั้งค่า Reverse Proxy (ถ้าต้องการ)
- [ ] เปลี่ยนรหัสผ่าน Admin
- [ ] ทดสอบระบบทั้งหมด

---

## 🎯 ขั้นตอนต่อไป

1. ✅ Deploy สำเร็จ → ทดสอบระบบ
2. 🔒 ตั้งค่า Security → เปลี่ยนรหัสผ่าน, SSL
3. 📊 ตั้งค่า Monitoring → Logs, Alerts
4. 🔄 ตั้งค่า Backup → Backup data volume

---

## 💡 Tips

- ใช้ **Named Volumes** สำหรับ data persistence
- ตั้งค่า **Auto-restart** policy ใน docker-compose.yml
- ใช้ **Health checks** เพื่อตรวจสอบสถานะ container
- ตั้งค่า **Resource limits** ถ้าต้องการจำกัดการใช้ทรัพยากร
- ใช้ **Portainer Templates** เพื่อ deploy ใหม่ได้ง่าย

---

## 📚 เอกสารเพิ่มเติม

- [Portainer Documentation](https://docs.portainer.io/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Synology Docker Guide](https://kb.synology.com/en-global/DSM/help/Docker/docker_desc)

