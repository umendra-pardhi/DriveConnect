const { verifyToken } = require("../utils/jwt");

function isLoggedIn(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) return next(); // Not logged in, allow access

    const decoded = verifyToken(token);
    if (decoded) {
      // Logged in → redirect to dashboard or homepage
      return res.redirect('/');
    }

    return next(); // Invalid token, continue to login/register
  } catch (err) {
    return next(); // Any error, just go to login/register
  }
}

module.exports = { isLoggedIn };