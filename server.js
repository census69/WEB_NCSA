const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose(); 

const app = express();
app.use(cors()); // อนุญาต CORS สำหรับทุกโดเมน
app.use(bodyParser.json());

app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString('th-TH');
  console.log(`[${timestamp}] ${req.method} request to ${req.url}`);
  next();
});

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
}); 

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  username TEXT, 
  password TEXT, 
  role TEXT,
  cart_count INTEGER DEFAULT 0,
  is_paid INTEGER DEFAULT 0
)`, (err) => {
  if (err) {
    console.error(" Error creating table:", err.message);
  } else {
    console.log(" Table 'users' is ready.");
  }
});

// ระบบ register สำหรับผู้ใช้ใหม่
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, 'user')`;

  db.run(sql, [username, password], function (err) {
    if (err) {
      console.error(` Register failed (Duplicate username): ${username}`);
      return res.json({ success: false, message: "Username ซ้ำ" });
    }
    console.log(` User registered successfully: ${username} (ID: ${this.lastID})`);
    res.json({ success: true });
  });
});

app.post("/login", (req, res) => { //ให้เปืดช่องโหว่ในการlogin เข้ามาให้้สามารถ SQL Injection ได้
  const { username, password } = req.body;
  const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;

  db.get(sql, [username, password], (err, row) => {
    if (err) {
      console.error(" Login database error:", err.message);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    
    if (row) {
      console.log(` Login successful: ${username} (Role: ${row.role})`);
      res.json({ success: true, user: row });
    } else {
      console.warn(` Login failed for username: ${username}`);
      res.json({ success: false });
    }
  });
});

app.get("/", (req, res) => {
  res.send("server is running");
});

function isAdmin(req, res, next) {
  const { role } = req.body;

  if (role === "admin") {
    next();
  } else {
    console.warn(` Access denied (Admin only expected)`);
    res.status(403).json({ message: "Access denied (admin only)" });
  }
}

app.get("/admin/users", (req, res) => { 
    const sql = "SELECT id, username, role, cart_count, is_paid FROM users WHERE role != 'admin'";
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(" Error fetching users:", err.message);
            return res.status(500).json({ success: false, message: err.message });
        }
        console.log(` Admin fetched ${rows.length} users.`);
        res.json({ success: true, users: rows });
    });
});

app.delete("/admin/delete/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) {
      console.error(` Error deleting user ID ${id}:`, err.message);
      return res.json({ success: false });
    }
    console.log(` User ID ${id} deleted successfully. Rows affected: ${this.changes}`);
    res.json({ success: true });
  });
});

app.post("/update-cart", (req, res) => {
  const { username, count } = req.body;
  db.run("UPDATE users SET cart_count = ? WHERE username = ?", [count, username], function(err) {
    if (err) {
      console.error(` Error updating cart for ${username}:`, err.message);
      return res.json({ success: false });
    }
    console.log(` Cart updated for ${username} (New count: ${count})`);
    res.json({ success: true });
  });
});

app.post("/admin/toggle-payment", (req, res) => {
  const { id, status } = req.body;
  db.run("UPDATE users SET is_paid = ? WHERE id = ?", [status, id], function(err) {
    if (err) {
      console.error(` Error toggling payment for user ID ${id}:`, err.message);
      return res.json({ success: false });
    }
    console.log(` Payment status toggled for user ID ${id} (New status: ${status})`);
    res.json({ success: true });
  });
});

app.listen(3000, () => {
  console.log(" Server running on http://localhost:3000");
});