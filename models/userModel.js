const pool = require("../config/db");

async function findByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows[0];
}

async function findById(id) {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
}

async function create(user) {
  const {
    email,
    password = null,
    name,
    phone = null,
    role = "client",
    avatar = null,
    is_oauth = false,
    is_verified = false,
  } = user;

  const [res] = await pool.query(
    `INSERT INTO users (email, password, name, phone, role, avatar, is_oauth, is_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [email, password, name, phone, role, avatar, is_oauth, is_verified]
  );

  return findById(res.insertId);
}

async function updateLastLogin(id) {
  await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [id]);
}

module.exports = { findByEmail, findById, create, updateLastLogin }; 

  