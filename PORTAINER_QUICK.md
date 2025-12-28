# ⚡ Deploy ผ่าน Portainer - วิธีด่วน

## 🚀 ขั้นตอนการ Deploy (5 นาที)

### 1️⃣ เตรียมไฟล์

อัปโหลดไฟล์ทั้งหมดไปยัง `/docker/meeting-registration/` ใน Synology NAS

**ไฟล์ที่ต้องอัปโหลด**:
- `Dockerfile`
- `docker-compose.portainer.yml` (หรือ `docker-compose.yml`)
- `package.json`, `package-lock.json`
- `server.js`, `database.js`
- `*.html`, `*.css`, `*.js` (ไฟล์ frontend ทั้งหมด)

### 2️⃣ เปิด Portainer

เปิดเบราว์เซอร์ไปที่:
```
http://your-nas-ip:9000
```

### 3️⃣ Build Image จาก Git Repository (แนะนำ - ง่ายที่สุด!)

**✅ วิธีที่ง่ายและเสถียรที่สุด: ใช้ Git Repository**

#### Option A: ใช้ Git Repository (แนะนำ)

1. **Push code ไปยัง Git** (GitHub/GitLab):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/meeting-registration.git
   git push -u origin main
   ```

2. **Build Image ใน Portainer**:
   - ไปที่ **Images** → **Build a new image**
   - ตั้งค่า:
     - **Name**: `meeting-registration:latest`
     - **Build method**: เลือก **Repository**
     - **Repository URL**: `https://github.com/your-username/meeting-registration.git`
     - **Reference**: `main`
     - **Dockerfile path**: `Dockerfile`
   - คลิก **Build the image**
   - รอให้ build เสร็จ (ประมาณ 2-5 นาที)

3. **สร้าง Stack**:
   - ไปที่ **Stacks** → **Add stack**
   - ใช้ไฟล์ `docker-compose.portainer-final.yml`
   - **แก้ไขรหัสผ่าน**:
     ```yaml
     environment:
       - ADMIN_PASSWORD=your_secure_password_here
       - SESSION_SECRET=your_random_secret_here
     ```
   - คลิก **Deploy the stack**

#### Option B: Build Image ผ่าน SSH (ถ้าไม่มี Git)

1. **เชื่อมต่อ SSH ไปยัง NAS**:
   ```bash
   ssh admin@your-nas-ip
   ```

2. **Build image**:
   ```bash
   cd /volume1/docker/meeting-registration
   docker build -t meeting-registration:latest .
   ```

3. **สร้าง Stack ใน Portainer**:
   - ใช้ไฟล์ `docker-compose.portainer-final.yml`

1. ไปที่ **Stacks** → คลิก **Add stack** (ปุ่มสีเขียว)
2. ตั้งชื่อ: `meeting-registration`
3. เลือก **Web editor**
4. **คัดลอกเนื้อหา** จาก `docker-compose.portainer-simple.yml` วางใน editor
   - หรือใช้ `docker-compose.portainer.yml` (ถ้าต้องการ build ใน stack)
5. **แก้ไขรหัสผ่าน** (สำคัญ!):
   ```yaml
   environment:
     - ADMIN_PASSWORD=your_secure_password_here
     - SESSION_SECRET=your_random_secret_here
   ```
6. คลิก **Deploy the stack**

### 4️⃣ ตรวจสอบ

1. รอให้ container เริ่มต้น (สถานะเป็น **Running** - สีเขียว)
2. ดู **Logs** เพื่อตรวจสอบว่าไม่มี error

### 5️⃣ เข้าถึงระบบ

- **หน้าแรก**: `http://your-nas-ip:3030`
- **Admin Login**: `http://your-nas-ip:3030/admin-login.html`
- **รหัสผ่าน**: ตามที่ตั้งค่าไว้ใน environment variables

---

## ⚠️ สิ่งสำคัญ

1. **เปลี่ยนรหัสผ่าน Admin ทันที!** (ใน environment variables)
2. **เปลี่ยน SESSION_SECRET** เป็น random string
3. ข้อมูลจะถูกเก็บใน volume `meeting-registration-data` (ไม่หายเมื่อ restart)

---

## 🔄 การอัปเดต

1. **Build image ใหม่** (ถ้าแก้ไข code):
   - ไปที่ **Images** → Build image ใหม่
2. **อัปเดต Stack**:
   - ไปที่ **Stacks** → `meeting-registration` → **Editor**
   - คลิก **Update the stack**

---

## ❌ การแก้ไขปัญหา

### Error: "path not found" หรือ "unable to prepare context"
**สาเหตุ**: Portainer ไม่สามารถเข้าถึง path ใน NAS โดยตรง

**แก้ไข**: 
- **วิธีที่ 1 (แนะนำ)**: ใช้ Git Repository (ดูขั้นตอนที่ 3)
- **วิธีที่ 2**: Build image ผ่าน SSH แล้วใช้ image
- **วิธีที่ 3**: ใช้ Docker Compose ผ่าน SSH โดยตรง

### Error: "invalid tar header"
**สาเหตุ**: การอัปโหลดไฟล์ build context ไม่ถูกต้อง

**แก้ไข**: 
- **วิธีที่ 1 (แนะนำ)**: ใช้ Git Repository แทนการ upload
- **วิธีที่ 2**: Build image ผ่าน SSH

### Error: "dockerfile : no such file or directory"
**แก้ไข**: ใช้ Git Repository หรือ build image ผ่าน SSH

**ดูรายละเอียด**: [PORTAINER_TROUBLESHOOTING.md](./PORTAINER_TROUBLESHOOTING.md)

---

## 📚 ดูรายละเอียดเพิ่มเติม

- **คู่มือละเอียด**: [PORTAINER_SYNOLOGY.md](./PORTAINER_SYNOLOGY.md)
- **คู่มือทั่วไป**: [PORTAINER_DEPLOY.md](./PORTAINER_DEPLOY.md)

