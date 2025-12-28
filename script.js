// API Base URL
const API_BASE_URL = 'http://localhost:3030/api';

// เก็บข้อมูลผู้ลงทะเบียน
let participants = [];

// ฟังก์ชันแปลงวันที่เป็นภาษาไทย
function formatThaiDate(date) {
    const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} เวลา ${hours}:${minutes}`;
}

// ดึงข้อมูลผู้ลงทะเบียนจาก API
async function fetchParticipants() {
    try {
        const response = await fetch(`${API_BASE_URL}/participants`);
        if (!response.ok) throw new Error('Failed to fetch participants');
        participants = await response.json();
        updateStats();
        displayParticipants();
    } catch (error) {
        console.error('Error fetching participants:', error);
        // Fallback to localStorage if API fails
        participants = JSON.parse(localStorage.getItem('participants')) || [];
        updateStats();
        displayParticipants();
    }
}

// อัปเดตสถิติ
function updateStats() {
    const total = participants.length;
    const inPerson = participants.filter(p => p.method === 'in-person').length;
    const zoom = participants.filter(p => p.method === 'zoom').length;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('inPersonCount').textContent = inPerson;
    document.getElementById('zoomCount').textContent = zoom;
}

// แสดงรายชื่อผู้ลงทะเบียน
function displayParticipants() {
    const listContainer = document.getElementById('participantsList');
    
    if (participants.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">ยังไม่มีผู้ลงทะเบียน</p>';
        return;
    }

    listContainer.innerHTML = participants.map((participant, index) => {
        const methodClass = participant.method === 'in-person' ? 'method-btn-in-person' : 'method-btn-zoom';
        const methodText = participant.method === 'in-person' ? 'พบหน้า' : 'Zoom';
        const methodIcon = participant.method === 'in-person' ? '📍' : '💻';
        const registrationDate = new Date(participant.timestamp);
        const formattedDate = formatThaiDate(registrationDate);
        
        return `
            <div class="participant-card" data-id="${participant.id}">
                <div class="participant-number">${index + 1}</div>
                <div class="participant-info">
                    <div class="participant-name">${participant.fullName}</div>
                    <div class="participant-time">${formattedDate}</div>
                </div>
                <div class="participant-actions">
                    <button class="participant-method-btn ${methodClass}" disabled>
                        ${methodIcon} ${methodText}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}


// จัดการปุ่มเลือกวิธีการเข้าร่วม
document.querySelectorAll('.method-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // ลบ active จากปุ่มทั้งหมด
        document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
        // เพิ่ม active ให้ปุ่มที่คลิก
        this.classList.add('active');
        // ตั้งค่าค่าใน hidden input
        document.getElementById('participationMethod').value = this.dataset.method;
    });
});

// จัดการฟอร์มลงทะเบียน
document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const participationMethod = document.getElementById('participationMethod').value;
    
    if (!fullName || !participationMethod) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    try {
        // เพิ่มข้อมูลใหม่
        const response = await fetch(`${API_BASE_URL}/participants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName,
                method: participationMethod,
            }),
        });

        if (!response.ok) throw new Error('Failed to add participant');

        alert(`ขอบคุณ ${fullName} ที่ลงทะเบียนเข้าร่วมประชุม!`);
        
        // รีเซ็ตฟอร์ม
        document.getElementById('registrationForm').reset();
        document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('participationMethod').value = '';
        
        // อัปเดตการแสดงผล
        await fetchParticipants();
    } catch (error) {
        console.error('Error saving participant:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
});

// โหลดข้อมูลการประชุม
async function fetchMeetingInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/meeting-info`);
        if (!response.ok) throw new Error('Failed to fetch meeting info');
        
        const meetingInfo = await response.json();
        if (meetingInfo) {
            // อัปเดตหัวข้อ
            if (meetingInfo.title) {
                document.getElementById('meetingTitleHeader').textContent = meetingInfo.title;
            }
            
            // อัปเดตวันที่
            if (meetingInfo.date) {
                const date = new Date(meetingInfo.date);
                const thaiMonths = [
                    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
                ];
                const day = date.getDate();
                const month = thaiMonths[date.getMonth()];
                const year = date.getFullYear() + 543;
                document.getElementById('meetingDateDisplay').textContent = `วันที่ ${day} ${month} ${year}`;
            } else {
                document.getElementById('meetingDateDisplay').textContent = '';
            }
            
            // อัปเดตสถานที่
            if (meetingInfo.location) {
                document.getElementById('meetingLocationDisplay').textContent = `สถานที่: ${meetingInfo.location}`;
            } else {
                document.getElementById('meetingLocationDisplay').textContent = '';
            }
            
            // อัปเดตเวลา
            if (meetingInfo.time) {
                const [hours, minutes] = meetingInfo.time.split(':');
                document.getElementById('meetingTimeDisplay').textContent = `เวลา: ${hours}:${minutes} น.`;
            } else {
                document.getElementById('meetingTimeDisplay').textContent = '';
            }
        }
    } catch (error) {
        console.error('Error fetching meeting info:', error);
    }
}

// โหลดข้อมูลเมื่อเปิดหน้าเว็บ
fetchParticipants();
fetchMeetingInfo();
