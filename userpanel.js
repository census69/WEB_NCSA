async function loadUserData() {
    const container = document.getElementById("user-table-container");
    container.innerHTML = "<p>กำลังโหลดข้อมูลจากระบบ...</p>";

    try {
        const res = await fetch("http://localhost:3000/admin/users");
        const data = await res.json();

        if (data.success) {
            renderUserTable(data.users); 
        }
    } catch (err) {
        console.error("Error:", err);
        container.innerHTML = "<p>เกิดข้อผิดพลาดในการดึงข้อมูล</p>";
    }
}
loadUserData();

function renderUserTable(users) {
  const container = document.getElementById("user-table-container");
  
  if (users.length === 0) {
    container.innerHTML = "<p>ไม่พบข้อมูลผู้ใช้งาน</p>";
    return;
  }

  let html = `
    <table class="user-table">
      <thead>
        <tr>
          <th>Username</th>
          <th>สินค้าในตะกร้า</th>
          <th>สถานะการชำระเงิน</th>
          <th>การจัดการ</th>
        </tr>
      </thead>
      <tbody>
  `;

  users.forEach(u => {
    // จัดการแสดงผลสถานะการจ่ายเงิน
    const isPaid = u.is_paid === 1;
    const statusText = isPaid ? "จ่ายแล้ว" : "ยังไม่จ่าย";
    const statusClass = isPaid ? "status-paid" : "status-pending";
    
    html += `
      <tr>
        <td><strong>${u.username}</strong></td>
        <td>${u.cart_count || 0} รายการ</td>
        <td class="${statusClass}">${statusText}</td>
        <td>
          <button class="action-btn" onclick="togglePayment(${u.id}, ${u.is_paid})">
            ${isPaid ? 'ยกเลิกจ่าย' : 'ยืนยันการจ่าย'}
          </button>
          <button class="action-btn" style="background: #e74c3c;" onclick="deleteUser(${u.id})">ลบ</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

// ฟังก์ชันลบ User 
async function deleteUser(id) {
  if (!confirm("ยืนยันการลบผู้ใช้งานนี้")) return;
  const res = await fetch(`http://localhost:3000/admin/delete/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (data.success) loadUserData();
}

// ฟังก์ชันสลับสถานะการจ่ายเงิน
async function togglePayment(id, currentStatus) {
  const newStatus = currentStatus === 1 ? 0 : 1;
  try {
    const res = await fetch("http://localhost:3000/admin/toggle-payment", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id, status: newStatus }) 
    });
    
    const data = await res.json();
    if (data.success) loadUserData();
  } catch (err) {
    alert("ไม่สามารถอัปเดตสถานะได้");
  }
}