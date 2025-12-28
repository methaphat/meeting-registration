#!/bin/bash

# Script สำหรับสร้าง build context tar.gz ที่ถูกต้อง
# ใช้เมื่อต้องการ upload ไปยัง Portainer

echo "📦 สร้าง build context tar.gz..."

# ตรวจสอบว่าอยู่ในโฟลเดอร์โปรเจ็กต์
if [ ! -f "Dockerfile" ]; then
    echo "❌ Error: ไม่พบ Dockerfile"
    echo "กรุณารัน script นี้ในโฟลเดอร์โปรเจ็กต์"
    exit 1
fi

# สร้าง tar.gz
tar -czf build-context.tar.gz \
    Dockerfile \
    package.json \
    package-lock.json \
    server.js \
    database.js \
    *.html \
    *.css \
    *.js \
    .dockerignore

if [ $? -eq 0 ]; then
    echo "✅ สร้าง build-context.tar.gz สำเร็จ!"
    echo "📤 อัปโหลดไฟล์นี้ไปยัง Portainer → Images → Build a new image"
    echo "   - Upload Dockerfile: Dockerfile"
    echo "   - Upload build context: build-context.tar.gz"
else
    echo "❌ Error: ไม่สามารถสร้าง tar.gz ได้"
    exit 1
fi

