const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


function signToken(payload) {
return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}


function verifyToken(token) {
return jwt.verify(token, process.env.JWT_SECRET);
}


module.exports = { signToken, verifyToken };