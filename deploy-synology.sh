#!/bin/bash

# สคริปต์สำหรับ deploy บน Synology NAS
# ใช้ผ่าน SSH

echo "=========================================="
echo "  Deploy Meeting Registration System"
echo "  สำหรับ Synology NAS"
echo "=========================================="
echo ""

# ตรวจสอบว่าอยู่ในโฟลเดอร์ที่ถูกต้อง
if [ ! -f "package.json" ]; then
    echo "❌ Error: ไม่พบไฟล์ package.json"
    echo "กรุณาไปที่โฟลเดอร์โปรเจ็กต์ก่อน"
    exit 1
fi

# ถามว่าจะใช้วิธีไหน
echo "เลือกวิธีการ deploy:"
echo "1) Docker Compose (แนะนำ)"
echo "2) PM2"
echo "3) Docker Compose + PM2"
read -p "เลือก (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📦 กำลัง deploy ด้วย Docker Compose..."
        
        # ตรวจสอบว่ามี docker-compose หรือไม่
        if ! command -v docker-compose &> /dev/null; then
            echo "❌ Error: ไม่พบ docker-compose"
            echo "กรุณาติดตั้ง Docker Compose ก่อน"
            exit 1
        fi
        
        # Build และ start
        docker-compose down
        docker-compose build
        docker-compose up -d
        
        echo ""
        echo "✅ Deploy สำเร็จ!"
        echo "ตรวจสอบ logs: docker-compose logs -f"
        ;;
        
    2)
        echo ""
        echo "📦 กำลัง deploy ด้วย PM2..."
        
        # ตรวจสอบว่ามี PM2 หรือไม่
        if ! command -v pm2 &> /dev/null; then
            echo "⚠️  PM2 ยังไม่ติดตั้ง กำลังติดตั้ง..."
            npm install -g pm2
        fi
        
        # ติดตั้ง dependencies
        echo "📥 กำลังติดตั้ง dependencies..."
        npm install --production
        
        # สร้างโฟลเดอร์ logs
        mkdir -p logs
        
        # Start ด้วย PM2
        pm2 delete meeting-registration 2>/dev/null
        pm2 start ecosystem.config.js
        pm2 save
        
        echo ""
        echo "✅ Deploy สำเร็จ!"
        echo "ตรวจสอบสถานะ: pm2 status"
        echo "ดู logs: pm2 logs meeting-registration"
        ;;
        
    3)
        echo ""
        echo "📦 กำลัง deploy ด้วย Docker Compose + PM2..."
        
        # Build Docker image
        docker-compose build
        
        # ติดตั้ง PM2 ใน container (ถ้าต้องการ)
        echo "⚠️  วิธีนี้ต้องตั้งค่าเองใน Dockerfile"
        ;;
        
    *)
        echo "❌ ตัวเลือกไม่ถูกต้อง"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "  ระบบพร้อมใช้งาน!"
echo "  URL: http://your-nas-ip:3000"
echo "=========================================="

