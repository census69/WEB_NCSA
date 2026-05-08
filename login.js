async function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: user,
        password: pass
      })
    });

    const data = await res.json();

    if (data.success) {
      // เก็บ session ฝั่ง browser
      localStorage.setItem("loggedInUser", data.user.username);
      localStorage.setItem("userRole", data.user.role);

      alert("เข้าสู่ระบบสำเร็จ " + data.user.username);
      window.location.href = "App.html";
    } else {
      alert("Username หรือ Password ไม่ถูกต้อง");
    }

  } catch (err) {
    console.error(err);
    alert("เชื่อม server ไม่ได้");
  }
}

async function register() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (!user || !pass) {
    alert("กรอกข้อมูลให้ครบ");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: user,
        password: pass
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("สมัครสำเร็จ");
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error(err);
    alert("เชื่อม server ไม่ได้");
  }
}