# คู่มือการตั้งค่า Backend และ Google Sheets

## ขั้นตอนการติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Google Sheets API

#### 2.1 สร้าง Google Cloud Project

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจ็กต์ใหม่หรือเลือกโปรเจ็กต์ที่มีอยู่
3. เปิดใช้งาน Google Sheets API:
   - ไปที่ "APIs & Services" > "Library"
   - ค้นหา "Google Sheets API"
   - คลิก "Enable"

#### 2.2 สร้าง Service Account

1. ไปที่ "APIs & Services" > "Credentials"
2. คลิก "Create Credentials" > "Service Account"
3. ตั้งชื่อ Service Account (เช่น "meeting-registration")
4. คลิก "Create and Continue"
5. ข้ามขั้นตอน "Grant this service account access to project" (ไม่จำเป็น)
6. คลิก "Done"

#### 2.3 สร้าง Key สำหรับ Service Account

1. คลิกที่ Service Account ที่สร้างไว้
2. ไปที่แท็บ "Keys"
3. คลิก "Add Key" > "Create new key"
4. เลือก "JSON"
5. ดาวน์โหลดไฟล์ JSON และบันทึกเป็น `credentials.json` ในโฟลเดอร์โปรเจ็กต์

#### 2.4 สร้าง Google Sheet และแชร์ให้ Service Account

1. สร้าง Google Sheet ใหม่
2. คัดลอก Spreadsheet ID จาก URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```
3. คลิก "Share" (แชร์)
4. คัดลอก Email ของ Service Account จากไฟล์ `credentials.json` (ดูที่ `client_email`)
5. วาง Email ในช่องแชร์และให้สิทธิ์ "Editor"
6. คลิก "Send"

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` จาก `env.example`:

```bash
cp env.example .env
```

แก้ไขไฟล์ `.env`:

```env
PORT=3030
SPREADSHEET_ID=your_spreadsheet_id_here
SHEET_NAME=Participants
GOOGLE_APPLICATION_CREDENTIALS=credentials.json
```

**หมายเหตุ:** แทนที่ `your_spreadsheet_id_here` ด้วย Spreadsheet ID ที่คัดลอกมา

### 4. เริ่มต้น Server

```bash
npm start
```

หรือสำหรับ development mode (auto-reload):

```bash
npm run dev
```

Server จะรันที่ `http://localhost:3030`

## API Endpoints

### GET /api/participants
ดึงข้อมูลผู้ลงทะเบียนทั้งหมด

### POST /api/participants
เพิ่มผู้ลงทะเบียนใหม่
```json
{
  "fullName": "ชื่อ-นามสกุล",
  "method": "in-person" หรือ "zoom"
}
```

### PUT /api/participants/:id
แก้ไขข้อมูลผู้ลงทะเบียน
```json
{
  "fullName": "ชื่อ-นามสกุล",
  "method": "in-person" หรือ "zoom"
}
```

### DELETE /api/participants/:id
ลบข้อมูลผู้ลงทะเบียน

## โครงสร้าง Google Sheet

Sheet จะมีคอลัมน์ดังนี้:
- **A**: ID
- **B**: ชื่อ-นามสกุล
- **C**: วิธีการเข้าร่วม (in-person หรือ zoom)
- **D**: วันที่ลงทะเบียน (ISO format)
- **E**: Timestamp

ระบบจะสร้าง header row อัตโนมัติเมื่อเริ่มต้นครั้งแรก

## การแก้ไขปัญหา

### Error: "The caller does not have permission"
- ตรวจสอบว่าแชร์ Google Sheet ให้ Service Account แล้ว
- ตรวจสอบว่า Service Account มีสิทธิ์ "Editor"

### Error: "Unable to parse range"
- ตรวจสอบว่า `SHEET_NAME` ใน `.env` ตรงกับชื่อ Sheet ใน Google Sheets
- ชื่อ Sheet ต้องตรงกันทุกตัวอักษร (case-sensitive)

### Error: "Requested entity was not found"
- ตรวจสอบว่า `SPREADSHEET_ID` ใน `.env` ถูกต้อง
- ตรวจสอบว่า Google Sheet ยังมีอยู่และไม่ถูกลบ

