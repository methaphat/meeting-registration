# 📤 คู่มืออัปโหลดขึ้น Git Repository ผ่าน Cursor

## 🚀 ขั้นตอนการ Setup

### ขั้นตอนที่ 1: สร้าง Git Repository

#### วิธีที่ 1: ใช้ Cursor (แนะนำ)

1. **เปิด Source Control ใน Cursor**
   - กด `Ctrl+Shift+G` หรือคลิกไอคอน Source Control ที่ sidebar ซ้าย
   - หรือไปที่ **View** → **Source Control**

2. **Initialize Repository**
   - คลิกปุ่ม **Initialize Repository** หรือ
   - เปิด Terminal ใน Cursor (`Ctrl+` ` หรือ **Terminal** → **New Terminal**)
   - รันคำสั่ง:
     ```bash
     git init
     ```

#### วิธีที่ 2: ใช้ Terminal

```bash
cd "C:\Users\User\OneDrive\Documents\Cursor"
git init
```

### ขั้นตอนที่ 2: เพิ่มไฟล์

1. **ใน Source Control Panel**:
   - ไฟล์ที่เปลี่ยนแปลงจะแสดงใน Source Control
   - คลิก **+** ข้างไฟล์เพื่อ stage หรือ
   - คลิก **+** ที่ **Changes** เพื่อ stage ทั้งหมด

2. **หรือใช้ Terminal**:
   ```bash
   git add .
   ```

### ขั้นตอนที่ 3: Commit

1. **ใน Source Control Panel**:
   - พิมพ์ commit message ในช่องด้านบน เช่น:
     ```
     Initial commit: Meeting registration system
     ```
   - กด `Ctrl+Enter` หรือคลิกปุ่ม **Commit**

2. **หรือใช้ Terminal**:
   ```bash
   git commit -m "Initial commit: Meeting registration system"
   ```

### ขั้นตอนที่ 4: สร้าง Repository บน GitHub/GitLab

1. **GitHub**:
   - ไปที่ https://github.com
   - คลิก **New repository**
   - ตั้งชื่อ repository (เช่น `meeting-registration`)
   - เลือก **Public** หรือ **Private**
   - **อย่า** check "Initialize with README"
   - คลิก **Create repository**

2. **GitLab**:
   - ไปที่ https://gitlab.com
   - คลิก **New project** → **Create blank project**
   - ตั้งชื่อ project
   - คลิก **Create project**

### ขั้นตอนที่ 5: เชื่อมต่อกับ Remote Repository

1. **คัดลอก Repository URL** จาก GitHub/GitLab:
   - GitHub: `https://github.com/username/meeting-registration.git`
   - GitLab: `https://gitlab.com/username/meeting-registration.git`

2. **เพิ่ม Remote**:
   
   **ใน Terminal**:
   ```bash
   git remote add origin https://github.com/username/meeting-registration.git
   ```
   
   แทนที่ URL ด้วย URL ของคุณ

3. **ตรวจสอบ**:
   ```bash
   git remote -v
   ```

### ขั้นตอนที่ 6: Push ขึ้น Repository

1. **ใน Terminal**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

2. **หรือใช้ Cursor**:
   - ไปที่ Source Control
   - คลิก **...** (More Actions)
   - เลือก **Push** หรือ **Sync**

---

## 📝 คำสั่ง Git ที่ใช้บ่อย

### ตรวจสอบสถานะ
```bash
git status
```

### เพิ่มไฟล์
```bash
git add .                    # เพิ่มทุกไฟล์
git add filename.js          # เพิ่มไฟล์เฉพาะ
```

### Commit
```bash
git commit -m "ข้อความอธิบาย"
```

### Push
```bash
git push origin main
```

### Pull (ดึงข้อมูลใหม่)
```bash
git pull origin main
```

### ดู Logs
```bash
git log
```

---

## 🔧 การแก้ไขปัญหา

### Error: "Authentication failed"

**แก้ไข**:
1. ใช้ Personal Access Token แทน password
2. GitHub: Settings → Developer settings → Personal access tokens
3. GitLab: Preferences → Access Tokens

### Error: "Repository not found"

**แก้ไข**:
- ตรวจสอบ URL
- ตรวจสอบว่า repository เป็น Public หรือคุณมีสิทธิ์เข้าถึง

### Error: "Permission denied"

**แก้ไข**:
- ตรวจสอบ username และ password/token
- ใช้ SSH key แทน HTTPS

---

## 🔐 ใช้ Personal Access Token (แนะนำ)

### GitHub:

1. ไปที่ **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. คลิก **Generate new token**
3. ตั้งชื่อ token
4. เลือก scopes: `repo` (full control)
5. คลิก **Generate token**
6. **คัดลอก token** (จะแสดงแค่ครั้งเดียว!)
7. ใช้ token แทน password เมื่อ push

### GitLab:

1. ไปที่ **Preferences** → **Access Tokens**
2. ตั้งชื่อ token
3. เลือก scopes: `write_repository`
4. คลิก **Create personal access token**
5. คัดลอก token

---

## ✅ Checklist

- [ ] Initialize git repository (`git init`)
- [ ] เพิ่มไฟล์ (`git add .`)
- [ ] Commit (`git commit -m "message"`)
- [ ] สร้าง repository บน GitHub/GitLab
- [ ] เพิ่ม remote (`git remote add origin <url>`)
- [ ] Push (`git push -u origin main`)
- [ ] ตรวจสอบบน GitHub/GitLab

---

## 🎯 หลังจาก Push สำเร็จ

1. ✅ ตรวจสอบไฟล์บน GitHub/GitLab
2. 🔗 ใช้ Git URL ใน Portainer
3. 🔄 Update stack ใน Portainer ให้ pull จาก Git

---

## 💡 Tips

- **Commit บ่อยๆ** เมื่อมีการเปลี่ยนแปลง
- **ใช้ commit message ที่ชัดเจน**
- **อย่า commit** `.env`, `node_modules`, `data/`
- **ใช้ .gitignore** เพื่อไม่ให้ commit ไฟล์ที่ไม่จำเป็น

---

**พร้อมใช้งานแล้ว!** 🚀

