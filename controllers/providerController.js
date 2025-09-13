const Provider = require("../models/providerModel");
const User = require("../models/userModel");
const pool = require("../config/db");

exports.register = async (req, res) => {
  const {
    email,
    name,
    phone,
    business_name,
    business_license,
    years_of_experience,
    about_experience,
    availability,
    service_areas = [],
    specializations = []
  } = req.body;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Check if user exists
    let user = await User.findByEmail(email);

    if (user) {
      // If user exists but is client, upgrade role to provider
      if (user.role === "client") {
        await pool.query("UPDATE users SET role = 'provider' WHERE id = ?", [user.id]);
        user.role = "provider";
      } else if (user.role === "provider") {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ error: "User is already registered as provider" });
      }
    } else {
      // If user does not exist, create new user as provider with null password
      user = await User.create({
        email,
        password: null, // must be set later
        name,
        phone,
        role: "provider",
        is_verified: false
      });
    }

    // 2. Create provider profile
    const provider = await Provider.create({
      user_id: user.id,
      business_name,
      business_license,
      years_of_experience,
      about_experience,
      availability,
    });

    const providerId = provider.id;

    // 3. Insert service areas
    for (let area of service_areas) {
      await connection.query(
        `INSERT INTO provider_service_areas (provider_id, city, state, zip_code) VALUES (?, ?, ?, ?)`,
        [providerId, area.city, area.state, area.zip_code]
      );
    }

    // 4. Insert specializations
    for (let spec of specializations) {
      await connection.query(
        `INSERT INTO provider_specializations (provider_id, specialization) VALUES (?, ?)`,
        [providerId, spec]
      );
    }

    await connection.commit();

    // If user has no password, notify frontend to ask for it
    if (!user.password) {
      return res.status(201).json({
        message: "Provider registered. Please set your password.",
        provider,
        user_id: user.id,
      });
    }

    res.status(201).json({ message: "Provider registered successfully", provider });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to register provider" });
  } finally {
    connection.release();
  }
};
