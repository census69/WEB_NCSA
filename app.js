const products = [ //const แนวๆบับไปaddressที่อื่นไม่ได้
  {
    id: 1,
    name: "Tent 4P",
    category: "Tent",
    price: 2000,
    images: ["../../images/tent1.png", "../../images/tent2.png", "../../images/tent3.png"],
    badge: "Best Seller",
    description: "เต็นท์ 2-4 คน ขนาดใหญ่ กันฝน เหมาะสำหรับครอบครัวหรือกลุ่มเพื่อน"
  },
  {
    id: 2,
    name: "Mountain Sleeping Bag",
    category: "Sleeping Bag",
    price: 1000,
    images: ["../../images/sleep1.png", "../../images/sleep2.png"],
    badge: "New",
    description: "ถุงนอนสำหรับอากาศเย็น พกง่าย นุ่มสบาย"
  },
  {
    id: 3,
    name: "FoldLite Chair",
    category: "Chair",
    price: 590,
    images: ["../../images/chair2.png", "../../images/chair3.png", "../../images/chair4.png", "../../images/chair1.png"],
    badge: "Hot",
    description: "เก้าอี้แคมป์ปิ้งพับได้ แข็งแรง น้ำหนักเบา"
  }
];

function renderProducts(filterCategory = 'all') { //โหลดสินค้าตามหมวด
  const list = document.getElementById("product-list");
  list.innerHTML = "";

  const filteredProducts = filterCategory === 'all'? products: products.filter(p => p.category === filterCategory);

  filteredProducts.forEach(p => {
    const badgeHtml = p.badge ? `<span class="badge">${p.badge}</span>` : '';
    const imagesHtml = p.images.map(img => `<img src="${img}" onerror="this.src='https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=500'"/>`).join('');

    list.innerHTML += `
        <div class="card">
          ${badgeHtml}
          
          <div class="image-slider">
            ${imagesHtml}
          </div>

          <div class="card-content">
            <h3>${p.name}</h3>
            <p class="desc">${p.description}</p>
            <p class="price">฿${p.price.toLocaleString()}</p>
            <button onclick="addToCart(${p.id})">เพิ่มลงตะกร้า</button>
          </div>
        </div>
      `;
  });
}

let cart = []; //ตะกล้าใส่สินค้า

async function addToCart(productId) {
    //เพิ่มข้อมูลลงcart
    cart.push(productId);

    //อัปเดตจำนวนสินค้าในตะกร้า
    document.getElementById("cart-count").innerText = cart.length;

    //ส่งข้อมูลไปอัปเดตใน Database
    const currentUser = localStorage.getItem("loggedInUser");
    
    if (currentUser) {
        try {
            await fetch("http://localhost:3000/update-cart", { //fetchตัวส่งAPI
                method: "POST",//เอาไว้ส่งข้อมูลไปที่Server
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({  //POST ใช้กับ BODY
                    username: currentUser,
                    count: cart.length 
                })
            });
            console.log("บันทึกตะกร้าลง Database สำเร็จ");
        } catch (err) {
            console.error("อัปเดตตะกร้าไม่สำเร็จ:", err);
        }
    } else {
        alert("กรุณาล็อกอินก่อนเพิ่มสินค้าลงตะกร้า");
    }
}

function goToLogin() {
  window.location.href = "login.html"; //มันเรียกไปหน้าLogin
}

function checkLoginStatus() {
  //ดึงข้อมูลชื่อ และ Role จาก localStorage
  const currentUser = localStorage.getItem("loggedInUser");
  const userRole = localStorage.getItem("userRole"); 

  // หาปุ่มLoginและตะกร้าสินค้า
  const loginBtn = document.querySelector(".login-btn");
  const cartElement = document.querySelector(".cart"); //เลือกใช้ Elementจากcss

  if (currentUser) { //กรณีมีการ Login แล้ว
    loginBtn.innerText = `Logout (${currentUser})`;
    loginBtn.onclick = logout;
    loginBtn.style.background = "#e74c3c";

    //เอาไว้ซ่อนตะกล้าของAdmin
    if (userRole === "admin") {
      if (cartElement) cartElement.style.display = "none"; 
    } else {
      if (cartElement) cartElement.style.display = "flex"; 
    }

  } else {
    // กรณีไม่ได้ Login
    loginBtn.innerText = "Login";
    loginBtn.onclick = goToLogin;
    loginBtn.style.background = "#28a745";

    if (cartElement) cartElement.style.display = "flex"; // แสดงตะกร้าไว้สำหรับลูกค้าทั่วไป
  }
}

function logout() {
  localStorage.removeItem("loggedInUser"); // ลบข้อมูล user ออกจากเบราว์เซอร์
  alert("ออกจากระบบเรียบร้อยแล้ว");
  window.location.reload(); // อัปเดตปุ่มกลับเป็น Login
}

function checkAdmin() {
  const role = localStorage.getItem("userRole");

  if (role === "admin") { //ช่องโหว่จ้า 
    const btn = document.createElement("button");
    btn.innerText = "Admin Panel";
    btn.onclick = () => {window.location.href = "admin.html"};

    document.querySelector(".header-actions").appendChild(btn); //.appendChild มันคือเอา bth ไปต่อจาก .header-actions
  }
}
renderProducts();
checkLoginStatus();
checkAdmin();