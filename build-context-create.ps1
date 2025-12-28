# PowerShell Script สำหรับสร้าง build context tar.gz ที่ถูกต้อง
# ใช้เมื่อต้องการ upload ไปยัง Portainer

Write-Host "📦 สร้าง build context tar.gz..." -ForegroundColor Cyan

# ตรวจสอบว่าอยู่ในโฟลเดอร์โปรเจ็กต์
if (-not (Test-Path "Dockerfile")) {
    Write-Host "❌ Error: ไม่พบ Dockerfile" -ForegroundColor Red
    Write-Host "กรุณารัน script นี้ในโฟลเดอร์โปรเจ็กต์" -ForegroundColor Yellow
    exit 1
}

# ตรวจสอบว่ามี tar command หรือไม่
$tarAvailable = $false
if (Get-Command tar -ErrorAction SilentlyContinue) {
    $tarAvailable = $true
}

if ($tarAvailable) {
    # ใช้ tar command (Windows 10 1803+)
    Write-Host "ใช้ tar command..." -ForegroundColor Green
    
    $files = @(
        "Dockerfile",
        "package.json",
        "package-lock.json",
        "server.js",
        "database.js"
    )
    
    # เพิ่มไฟล์ HTML, CSS, JS
    $files += Get-ChildItem -Filter "*.html" | Select-Object -ExpandProperty Name
    $files += Get-ChildItem -Filter "*.css" | Select-Object -ExpandProperty Name
    $files += Get-ChildItem -Filter "*.js" | Select-Object -ExpandProperty Name
    $files += ".dockerignore"
    
    tar -czf build-context.tar.gz $files
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ สร้าง build-context.tar.gz สำเร็จ!" -ForegroundColor Green
        Write-Host "📤 อัปโหลดไฟล์นี้ไปยัง Portainer → Images → Build a new image" -ForegroundColor Cyan
        Write-Host "   - Upload Dockerfile: Dockerfile" -ForegroundColor Yellow
        Write-Host "   - Upload build context: build-context.tar.gz" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error: ไม่สามารถสร้าง tar.gz ได้" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ ไม่พบ tar command" -ForegroundColor Red
    Write-Host "วิธีแก้ไข:" -ForegroundColor Yellow
    Write-Host "1. ใช้วิธี Build จาก Path ใน NAS (แนะนำ)" -ForegroundColor Cyan
    Write-Host "2. ติดตั้ง 7-Zip และใช้คำสั่ง:" -ForegroundColor Cyan
    Write-Host "   7z a -ttar build-context.tar *" -ForegroundColor White
    Write-Host "   7z a -tgzip build-context.tar.gz build-context.tar" -ForegroundColor White
    Write-Host "3. ใช้ Git Repository แทน" -ForegroundColor Cyan
}

