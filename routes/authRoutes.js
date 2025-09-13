const express = require("express");
const router = express.Router();
const {register, login, logout, oauthSuccess, oauthFailure  } = require("../controllers/authController");
const passport = require("passport");

router.post("/register", register); 
router.post("/login", login);
router.get("/logout", logout);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
    session: true,
  }),
  oauthSuccess
);

router.get("/failure", oauthFailure);

module.exports = router;
