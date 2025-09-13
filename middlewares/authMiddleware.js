const { verifyToken } = require("../utils/jwt");

async function authenticateJWT(req, res, next) {
  try {
    // JWT can be sent via Authorization header or cookie named 'token'
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.startsWith("Bearer "))
      token = authHeader.split(" ")[1];
    else if (req.cookies && req.cookies.token) token = req.cookies.token;

    if (!token)
      //   return res.status(401).json({ message: "Unauthorized - token missing" });
      return res.status(401).redirect("/login");

    const decoded = verifyToken(token);
    req.user = decoded; // contains whatever we signed (e.g., id, email, role)
   
    next();
  } catch (err) {
    // return res.status(401).json({ message: "Unauthorized - invalid token" });
    return res.status(401).redirect("/login");
  }
}

module.exports = { authenticateJWT };
