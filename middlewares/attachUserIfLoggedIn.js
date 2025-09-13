const { verifyToken } = require("../utils/jwt");

function attachUserIfLoggedIn(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(); // No token — proceed without attaching user
    }

    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded; // Attach user info to req
    }

    next();
  } catch (err) {
    // If token is invalid or expired, just proceed without user
    next();
  }
}

module.exports =  attachUserIfLoggedIn ;
