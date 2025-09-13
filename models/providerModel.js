const pool = require("../config/db");

/**
 * Find provider by ID
 */
async function findById(id) {
  const [rows] = await pool.query("SELECT * FROM providers WHERE id = ?", [id]);
  return rows[0];
}

/**
 * Find provider by user_id
 */
async function findByUserId(userId) {
  const [rows] = await pool.query("SELECT * FROM providers WHERE user_id = ?", [userId]);
  return rows[0];
}

/**
 * Create a new provider
 */
async function create(provider) {
  const {
    user_id,
    business_name = null,
    business_license = null,
    years_of_experience = 0,
    about_experience = null,
    availability = null,
  } = provider;

  const [res] = await pool.query(
    `INSERT INTO providers (user_id, business_name, business_license, years_of_experience, about_experience, availability)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, business_name, business_license, years_of_experience, about_experience, availability]
  );

  return findById(res.insertId);
}

/**
 * Update provider details
 */
async function update(id, updates) {
  const fields = [];
  const values = [];

  for (const key in updates) {
    fields.push(`${key} = ?`);
    values.push(updates[key]);
  }

  if (fields.length === 0) return findById(id);

  values.push(id);

  await pool.query(`UPDATE providers SET ${fields.join(", ")} WHERE id = ?`, values);

  return findById(id);
}

/**
 * Delete provider
 */
async function remove(id) {
  await pool.query("DELETE FROM providers WHERE id = ?", [id]);
  return { message: "Provider deleted" };
}

module.exports = {
  findById,
  findByUserId,
  create,
  update,
  remove,
};
