// API Base URL
const API_BASE_URL = 'http://localhost:3030/api';

let allParticipants = [];
let filteredParticipants = [];

// ฟังก์ชันแปลงวันที่เป็นภาษาไทย
function formatThaiDate(date) {
    const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} เวลา ${hours}:${minutes}`;
}

// โหลดข้อมูล
async function loadData() {
    try {
        const response = await fetch(`${API_BASE_URL}/participants`, {
            credentials: 'include'
        });
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'admin-login.html';
                return;
            }
            throw new Error('Failed to fetch participants');
        }
        
        allParticipants = await response.json();
        filteredParticipants = [...allParticipants];
        
        updateStats();
        displayTable();
        updateLastUpdate();
        checkApiStatus(true);
    } catch (error) {
        console.error('Error loading data:', error);
        checkApiStatus(false);
        document.getElementById('participantsTableBody').innerHTML = 
            '<tr><td colspan="5" class="loading" style="color: #f44336;">ไม่สามารถเชื่อมต่อกับ API ได้</td></tr>';
    }
}

// อัปเดตสถิติ
function updateStats() {
    const total = allParticipants.length;
    const inPerson = allParticipants.filter(p => p.method === 'in-person').length;
    const zoom = allParticipants.filter(p => p.method === 'zoom').length;

    document.getElementById('adminTotalCount').textContent = total;
    document.getElementById('adminInPersonCount').textContent = inPerson;
    document.getElementById('adminZoomCount').textContent = zoom;
}

// แสดงตารางข้อมูล
function displayTable() {
    const tbody = document.getElementById('participantsTableBody');
    
    if (filteredParticipants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">ไม่พบข้อมูล</td></tr>';
        return;
    }

    tbody.innerHTML = filteredParticipants.map((participant, index) => {
        const methodClass = participant.method === 'in-person' ? 'in-person' : 'zoom';
        const methodText = participant.method === 'in-person' ? 'พบหน้า' : 'Zoom';
        const registrationDate = new Date(participant.timestamp);
        const formattedDate = formatThaiDate(registrationDate);
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${participant.fullName}</td>
                <td><span class="method-badge ${methodClass}">${methodText}</span></td>
                <td>${formattedDate}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn edit-table-btn" onclick="openEditModal('${participant.id}')">
                            ✏️ แก้ไข
                        </button>
                        <button class="table-btn delete-table-btn" onclick="deleteParticipant('${participant.id}')">
                            🗑️ ลบ
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ค้นหาข้อมูล
function filterParticipants() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        filteredParticipants = [...allParticipants];
    } else {
        filteredParticipants = allParticipants.filter(p => 
            p.fullName.toLowerCase().includes(searchTerm)
        );
    }
    
    displayTable();
}

// เปิด Modal แก้ไข
function openEditModal(id) {
    const participant = allParticipants.find(p => p.id === id);
    if (!participant) return;

    document.getElementById('editId').value = participant.id;
    document.getElementById('editFullName').value = participant.fullName;
    document.getElementById('editMethod').value = participant.method;
    
    // ตั้งค่าปุ่มวิธีการเข้าร่วม
    document.querySelectorAll('#editForm .method-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.method === participant.method) {
            btn.classList.add('active');
        }
    });

    document.getElementById('editModal').classList.add('show');
}

// ปิด Modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    document.getElementById('editForm').reset();
}

// เลือกวิธีการเข้าร่วมใน Modal
function selectMethod(method) {
    document.getElementById('editMethod').value = method;
    document.querySelectorAll('#editForm .method-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.method === method) {
            btn.classList.add('active');
        }
    });
}

// บันทึกการแก้ไข
document.getElementById('editForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const fullName = document.getElementById('editFullName').value.trim();
    const method = document.getElementById('editMethod').value;
    
    if (!fullName || !method) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/participants/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ fullName, method }),
        });

        if (response.status === 401) {
            alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
            window.location.href = 'admin-login.html';
            return;
        }

        if (!response.ok) throw new Error('Failed to update participant');

        alert('แก้ไขข้อมูลสำเร็จ');
        closeEditModal();
        await loadData();
    } catch (error) {
        console.error('Error updating participant:', error);
        alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    }
});

// ลบข้อมูล
async function deleteParticipant(id) {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/participants/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.status === 401) {
            alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
            window.location.href = 'admin-login.html';
            return;
        }

        if (!response.ok) throw new Error('Failed to delete participant');

        alert('ลบข้อมูลสำเร็จ');
        await loadData();
    } catch (error) {
        console.error('Error deleting participant:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
}

// ส่งออก CSV
function exportToCSV() {
    if (allParticipants.length === 0) {
        alert('ไม่มีข้อมูลให้ส่งออก');
        return;
    }

    const headers = ['ลำดับ', 'ชื่อ-นามสกุล', 'วิธีการเข้าร่วม', 'วันที่ลงทะเบียน'];
    const rows = allParticipants.map((p, index) => {
        const methodText = p.method === 'in-person' ? 'พบหน้า' : 'Zoom';
        const date = new Date(p.timestamp);
        const formattedDate = formatThaiDate(date);
        return [index + 1, p.fullName, methodText, formattedDate];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `participants_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('ส่งออกไฟล์ CSV สำเร็จ');
}

// ลบข้อมูลทั้งหมด
async function clearAllData() {
    if (!confirm('⚠️ คำเตือน: คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด?\n\nการกระทำนี้ไม่สามารถยกเลิกได้!')) {
        return;
    }

    if (!confirm('กรุณายืนยันอีกครั้ง: คุณต้องการลบข้อมูลทั้งหมดจริงๆ?')) {
        return;
    }

    try {
        // ลบทีละรายการ
        for (const participant of allParticipants) {
            const response = await fetch(`${API_BASE_URL}/participants/${participant.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.status === 401) {
                alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
                window.location.href = 'admin-login.html';
                return;
            }
            if (!response.ok) throw new Error('Failed to delete participant');
        }

        alert('ลบข้อมูลทั้งหมดสำเร็จ');
        await loadData();
    } catch (error) {
        console.error('Error clearing data:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
}

// อัปเดตเวลาล่าสุด
function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('th-TH');
    document.getElementById('lastUpdate').textContent = timeString;
}

// ตรวจสอบสถานะ API
async function checkApiStatus(success) {
    const statusElement = document.getElementById('apiStatus');
    if (success) {
        statusElement.textContent = 'เชื่อมต่อสำเร็จ';
        statusElement.className = 'info-value status-ok';
    } else {
        statusElement.textContent = 'เชื่อมต่อล้มเหลว';
        statusElement.className = 'info-value status-error';
    }
}

// ปิด Modal เมื่อคลิกนอก Modal
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
}

// ตรวจสอบ authentication
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/check`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.authenticated) {
            // ถ้ายังไม่ล็อกอิน ให้ redirect ไปหน้า login
            window.location.href = 'admin-login.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error checking auth:', error);
        window.location.href = 'admin-login.html';
        return false;
    }
}

// Logout
async function logout() {
    if (!confirm('คุณต้องการออกจากระบบหรือไม่?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = 'admin-login.html';
        } else {
            alert('เกิดข้อผิดพลาดในการออกจากระบบ');
        }
    } catch (error) {
        console.error('Error logging out:', error);
        alert('เกิดข้อผิดพลาดในการออกจากระบบ');
    }
}

// โหลดข้อมูลการประชุม
async function loadMeetingInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/meeting-info`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch meeting info');
        
        const meetingInfo = await response.json();
        if (meetingInfo) {
            document.getElementById('meetingTitle').value = meetingInfo.title || '';
            document.getElementById('meetingDate').value = meetingInfo.date || '';
            document.getElementById('meetingLocation').value = meetingInfo.location || '';
            document.getElementById('meetingTime').value = meetingInfo.time || '';
        }
    } catch (error) {
        console.error('Error loading meeting info:', error);
    }
}

// บันทึกข้อมูลการประชุม
document.getElementById('meetingInfoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('meetingTitle').value.trim();
    const date = document.getElementById('meetingDate').value;
    const location = document.getElementById('meetingLocation').value.trim();
    const time = document.getElementById('meetingTime').value;
    
    if (!title || !date || !location || !time) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/meeting-info`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ title, date, location, time }),
        });

        if (response.status === 401) {
            alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
            window.location.href = 'admin-login.html';
            return;
        }

        if (!response.ok) throw new Error('Failed to update meeting info');

        alert('บันทึกข้อมูลการประชุมสำเร็จ');
    } catch (error) {
        console.error('Error saving meeting info:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
});

// โหลดข้อมูลเมื่อเปิดหน้า (หลังจากตรวจสอบ auth)
checkAuth().then((authenticated) => {
    if (authenticated) {
        loadData();
        loadMeetingInfo();
        // Auto refresh ทุก 30 วินาที
        setInterval(loadData, 30000);
    }
});

