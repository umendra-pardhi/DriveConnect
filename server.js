const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require('path');
const passport = require("./config/passport");

const staticRoutes = require("./routes/staticRoutes");
const authRoutes = require("./routes/authRoutes");
const providerRoutes = require("./routes/providerRoutes");


dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.set('view engine','ejs');

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve("./views")));
app.use(express.static(path.resolve("./views")));


app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: process.env.NODE_ENV === 'production' }
  })
);
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use("/api/auth", authRoutes);

app.use("/api/provider", providerRoutes);


app.use("/",staticRoutes);


app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
