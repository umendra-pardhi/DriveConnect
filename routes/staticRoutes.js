const express = require("express");
const staticRouter = express.Router();


const { authenticateJWT } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/authorizeRoles");
const { isLoggedIn } = require("../middlewares/isLoggedIn");
const attachUserIfLoggedIn = require("../middlewares/attachUserIfLoggedIn");



staticRouter.get('/', attachUserIfLoggedIn, (req, res) => {
  res.render('index',{ user: req.user });
});
staticRouter.get('/client-dashboard',authenticateJWT, authorizeRoles('client'),  (req, res) => {
  res.render('client-dashboard');
});
staticRouter.get('/provider-dashboard',authenticateJWT,authorizeRoles('provider'), (req, res) => {
  res.render('provider-dashboard');
}); 
staticRouter.get('/admin-dashboard',authenticateJWT,authorizeRoles('admin'), (req, res) => {
  res.render('admin-dashboard');
});

staticRouter.get('/booking', (req, res) => {
  res.render('booking');
});

staticRouter.get('/login', isLoggedIn, (req, res) => {
  res.render('login');
});
staticRouter.get('/register',isLoggedIn, (req, res) => {
  res.render('register');
});

staticRouter.get('/search-garage', (req, res) => {
  res.render('search-garage');
});

staticRouter.get('/service-provider', (req, res) => {
  res.render('service-provider');
});



module.exports = staticRouter;
