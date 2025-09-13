const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const { signToken } = require("../utils/jwt");

const saltRounds = 10;

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;
    if (!email || !password || !firstName || !lastName || !phone || !role)
      return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findByEmail(email);
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    if (!["client", "provider"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const name = firstName + " " + lastName;

    const hashed = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ email, password: hashed, name, phone, role });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    // res.status(201).json({ message: "User created", token });
    if (role === "provider") {
      // return res.status(201).redirect("/provider-dashboard");
      res.status(201).json({ message: "User created",redirectUrl: "/provider-dashboard" , token });
      
    } else if (role === "client") {
      // return res.status(201).redirect("/client-dashboard");
      res.status(201).json({ message: "User created",redirectUrl: "/client-dashboard" , token });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing email or password" });

    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.password)
      return res
        .status(403)
        .json({ message: "Use social login for this account" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    await User.updateLastLogin(user.id);

    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    // res.json({ message: "Logged in", token });

    if (user.role === "provider") {
      // return res.redirect("/provider-dashboard");
      res.json({ message: "Logged in", redirectUrl:"/provider-dashboard", token });

    } else if (user.role === "client") {
      // return res.redirect("/client-dashboard");
      res.json({ message: "Logged in", redirectUrl:"/client-dashboard", token });
    } else if (user.role === "admin") {
      // return res.redirect("/admin-dashboard");
      res.json({ message: "Logged in", redirectUrl:"/admin-dashboard", token });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// const logout = async (req, res) => {
//   res.clearCookie("token");
//   req.logout && req.logout();
//   res.json({ message: "Logged out" });
// };

const logout = (req, res, next) => {
  // Clear JWT token cookie
  res.clearCookie("token");

  // Handle Passport session logout if available
  if (req.logout) {
    req.logout(function (err) {
      if (err) return next(err);
      req.session?.destroy(() => {
        res.clearCookie("connect.sid");
        // return res.json({ message: "Logged out successfully" });
        return res.redirect("/login");
      });
    });
  } else {
    // return res.json({ message: "Logged out successfully" });
    return res.redirect("/login");
  }
};

// const oauthSuccess = (req, res) => {
//   // res.json({ message: "Google OAuth success", user: req.user });
//   return res.redirect("/client-dashboard");
// };

const oauthSuccess = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ message: "No user info from OAuth" });
    }

    console.log("OAuth user:", req.user);
    const {
      email,
      name,
      avatar = null,
      role = "client", 
      phone = null,
      is_oauth = true,
      is_verified = true
    } = req.user;


    // Check if user already exists
    let user = await User.findByEmail(email);

    // If not found, create new user
    if (!user) {
      if (!["client", "provider"].includes(role)) {
        return res.status(400).json({ message: "Invalid role from OAuth" });
      }

      user = await User.create({
        email,
        password: null,
        name,
        phone,
        role,
        avatar,
        is_oauth,
        is_verified 
      });

    }

    // Sign JWT token
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Update last login
    await User.updateLastLogin(user.id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    // Redirect based on role
    switch (user.role) {
      case "provider":
        return res.redirect("/provider-dashboard");
      case "client":
        return res.redirect("/client-dashboard");
      case "admin":
        return res.redirect("/admin-dashboard");
      default:
        return res.redirect("/login");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OAuth login failed" });
  }
};



const oauthFailure = (req, res) => {
  res.status(401).json({ message: "Google OAuth failed" });
};

module.exports = { register, login, logout, oauthSuccess, oauthFailure };
