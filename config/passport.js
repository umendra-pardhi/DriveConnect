const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("./db");
const { v4: uuidv4 } = require("uuid");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length) return done(null, rows[0]);
    done(null, null);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails[0] && profile.emails[0].value;
        const name = profile.displayName || "Google User";
        const avatar =
          profile.photos && profile.photos[0] && profile.photos[0].value;

        // find or create user
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
          email,
        ]);
        if (rows.length) {
          const user = rows[0];
          // update avatar/name if new
          await pool.query(
            "UPDATE users SET avatar = ?, name = ?, is_verified = ? WHERE id = ?",
            [avatar, name, 1, user.id]
          );
          return done(null, { id: user.id, email: user.email });
        }

        const tmpPassword = uuidv4(); // random password for social accounts (not used)
        const [res] = await pool.query(
          "INSERT INTO users (email, password, name, avatar, is_verified, phone) VALUES (?, ?, ?, ?, ?, ?)",
          [email, tmpPassword, name, avatar, 1, ""]
        );
        const newUserId = res.insertId;
        return done(null, { id: newUserId, email });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;
