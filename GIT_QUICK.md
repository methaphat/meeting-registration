# ⚡ อัปโหลดขึ้น Git - วิธีด่วน

## 🚀 ขั้นตอน 3 ขั้นตอน

### 1. สร้าง Repository บน GitHub/GitLab

**GitHub**:
1. ไปที่ https://github.com/new
2. ตั้งชื่อ: `meeting-registration`
3. เลือก **Public** หรือ **Private**
4. **อย่า** check "Initialize with README"
5. คลิก **Create repository**

**GitLab**:
1. ไปที่ https://gitlab.com/projects/new
2. ตั้งชื่อ: `meeting-registration`
3. คลิก **Create project**

### 2. เชื่อมต่อและ Push

**ใน Terminal ของ Cursor**:

```bash
# Commit ไฟล์
git commit -m "Initial commit: Meeting registration system"

# เปลี่ยน branch เป็น main
git branch -M main

# เพิ่ม remote (แทนที่ URL ด้วย URL ของคุณ)
git remote add origin https://github.com/username/meeting-registration.git

# Push ขึ้น repository
git push -u origin main
```

### 3. ใช้ใน Portainer

1. ไปที่ **Stacks** → **Add stack**
2. เลือก **Repository**
3. ใส่ Git URL: `https://github.com/username/meeting-registration.git`
4. ระบุ path: `docker-compose.yml`
5. Deploy!

---

## 📝 หมายเหตุ

- ใช้ **Personal Access Token** แทน password
- URL จะเป็น: `https://github.com/username/repo.git`
- Branch: `main` หรือ `master`

---

**ดูรายละเอียด**: [GIT_SETUP.md](./GIT_SETUP.md)

