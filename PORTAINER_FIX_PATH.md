# 🔧 แก้ไขปัญหา "path not found" ใน Portainer

## ❌ ปัญหา

เมื่อ deploy stack ใน Portainer เจอ error:
```
Failed to deploy a stack: compose build operation failed: 
unable to prepare context: path "/volume1/docker/meeting-registration" not found
```

## 🔍 สาเหตุ

Portainer รันใน container และไม่สามารถเข้าถึง host filesystem (`/volume1/docker/`) โดยตรงได้

## ✅ วิธีแก้ไข (เลือกวิธีใดวิธีหนึ่ง)

---

## 🎯 วิธีที่ 1: ใช้ Git Repository (แนะนำ - ง่ายที่สุด!)

### ขั้นตอน:

1. **สร้าง Git Repository**:
   - สร้าง repository ใหม่ใน GitHub/GitLab/Bitbucket
   - หรือใช้ repository ที่มีอยู่แล้ว

2. **Push code ไปยัง Git**:
   ```bash
   # ในโฟลเดอร์โปรเจ็กต์
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/meeting-registration.git
   git branch -M main
   git push -u origin main
   ```

3. **Build Image จาก Git ใน Portainer**:
   - ไปที่ **Images** → **Build a new image**
   - ตั้งค่า:
     - **Name**: `meeting-registration:latest`
     - **Build method**: เลือก **Repository**
     - **Repository URL**: `https://github.com/your-username/meeting-registration.git`
     - **Reference**: `main` (หรือ `master`)
     - **Dockerfile path**: `Dockerfile`
   - คลิก **Build the image**
   - รอให้ build เสร็จ

4. **สร้าง Stack**:
   - ไปที่ **Stacks** → **Add stack**
   - ตั้งชื่อ: `meeting-registration`
   - เลือก **Web editor**
   - ใช้ไฟล์ `docker-compose.portainer-final.yml`:
     ```yaml
     version: '3.8'
     
     services:
       meeting-registration:
         image: meeting-registration:latest
         container_name: meeting-registration-app
         restart: unless-stopped
         ports:
           - "3030:3030"
         environment:
           - PORT=3030
           - ADMIN_PASSWORD=your_password
           - SESSION_SECRET=your_secret
         volumes:
           - meeting-data:/app/data
         networks:
           - meeting-network
     
     volumes:
       meeting-data:
         driver: local
     
     networks:
       meeting-network:
         driver: bridge
     ```
   - แก้ไข `ADMIN_PASSWORD` และ `SESSION_SECRET`
   - คลิก **Deploy the stack**

---

## 🎯 วิธีที่ 2: Build Image ผ่าน SSH

### ขั้นตอน:

1. **เชื่อมต่อ SSH ไปยัง NAS**:
   ```bash
   ssh admin@your-nas-ip
   ```

2. **ไปที่โฟลเดอร์โปรเจ็กต์**:
   ```bash
   cd /volume1/docker/meeting-registration
   # หรือ
   cd /docker/meeting-registration
   ```

3. **Build image**:
   ```bash
   docker build -t meeting-registration:latest .
   ```

4. **ตรวจสอบ image**:
   ```bash
   docker images | grep meeting-registration
   ```

5. **สร้าง Stack ใน Portainer**:
   - ใช้ไฟล์ `docker-compose.portainer-final.yml`
   - Image จะถูกใช้จาก local Docker registry

---

## 🎯 วิธีที่ 3: ใช้ Docker Compose ผ่าน SSH (ไม่ใช้ Portainer Stack)

### ขั้นตอน:

1. **เชื่อมต่อ SSH**:
   ```bash
   ssh admin@your-nas-ip
   ```

2. **ไปที่โฟลเดอร์**:
   ```bash
   cd /volume1/docker/meeting-registration
   ```

3. **สร้าง docker-compose.yml** (ถ้ายังไม่มี):
   ```yaml
   version: '3.8'
   
   services:
     meeting-registration:
       build: .
       container_name: meeting-registration-app
       restart: unless-stopped
       ports:
         - "3030:3030"
       environment:
         - PORT=3030
         - ADMIN_PASSWORD=your_password
         - SESSION_SECRET=your_secret
       volumes:
         - meeting-data:/app/data
       networks:
         - meeting-network
   
   volumes:
     meeting-data:
       driver: local
   
   networks:
     meeting-network:
       driver: bridge
   ```

4. **Deploy**:
   ```bash
   docker-compose up -d --build
   ```

5. **ตรวจสอบ**:
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

**หมายเหตุ**: วิธีนี้จะไม่ใช้ Portainer Stack แต่จะใช้ Docker Compose โดยตรง

---

## 🎯 วิธีที่ 4: ตั้งค่า Bind Mount ใน Portainer (ขั้นสูง)

### ขั้นตอน:

1. **ตรวจสอบ Portainer Container**:
   ```bash
   docker ps | grep portainer
   ```

2. **แก้ไข Portainer Container Settings**:
   - เพิ่ม bind mount: `/volume1:/host/volume1`
   - หรือ `/docker:/host/docker`

3. **Restart Portainer**:
   ```bash
   docker restart portainer
   ```

4. **แก้ไข docker-compose.yml**:
   ```yaml
   build:
     context: /host/volume1/docker/meeting-registration
     dockerfile: /host/volume1/docker/meeting-registration/Dockerfile
   ```

**หมายเหตุ**: วิธีนี้อาจซับซ้อนและต้องแก้ไข Portainer container

---

## 📝 สรุปวิธีที่แนะนำ

1. **วิธีที่ 1 (Git Repository)** - ง่ายที่สุด, เสถียร, แนะนำ
2. **วิธีที่ 2 (Build ผ่าน SSH)** - ง่าย, ใช้ได้ทันที
3. **วิธีที่ 3 (Docker Compose ผ่าน SSH)** - ไม่ใช้ Portainer Stack
4. **วิธีที่ 4 (Bind Mount)** - ซับซ้อน, ไม่แนะนำ

---

## ✅ Checklist

- [ ] เลือกวิธีแก้ไข
- [ ] Build image สำเร็จ
- [ ] สร้าง Stack ใน Portainer
- [ ] Container รันอยู่
- [ ] ทดสอบเข้าถึงได้
- [ ] เปลี่ยนรหัสผ่าน Admin

---

**🎯 แนะนำ: ใช้วิธีที่ 1 (Git Repository) จะง่ายและเสถียรที่สุด!**

