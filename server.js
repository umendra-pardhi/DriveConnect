const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('📦 Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/client-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'client-dashboard.html'));
});

app.get('/provider-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'provider-dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// API Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      phone,
      role: role || 'client'
    });
    
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get client bookings
app.get('/api/client/bookings', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const userBookings = await Booking.find({ clientId: req.user.id })
      .populate('providerId', 'name email phone');
    res.json(userBookings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get provider bookings
app.get('/api/provider/bookings', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const providerBookings = await Booking.find({ providerId: req.user.id })
      .populate('clientId', 'name email phone');
    res.json(providerBookings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all bookings (admin)
app.get('/api/admin/bookings', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const allBookings = await Booking.find()
      .populate('clientId', 'name email phone')
      .populate('providerId', 'name email phone');
    res.json(allBookings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dashboard stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    let stats = {};
    
    if (req.user.role === 'client') {
      const userBookings = await Booking.find({ clientId: req.user.id });
      stats = {
        totalBookings: userBookings.length,
        completedServices: userBookings.filter(b => b.status === 'completed').length,
        totalSpent: userBookings.reduce((sum, b) => sum + b.price, 0),
        upcomingBookings: userBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length
      };
    } else if (req.user.role === 'provider') {
      const providerBookings = await Booking.find({ providerId: req.user.id });
      stats = {
        totalBookings: providerBookings.length,
        completedServices: providerBookings.filter(b => b.status === 'completed').length,
        totalEarnings: providerBookings.reduce((sum, b) => sum + b.price, 0),
        averageRating: 4.8
      };
    } else if (req.user.role === 'admin') {
      const [totalUsers, serviceProviders, totalBookings] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'provider' }),
        Booking.find()
      ]);
      
      stats = {
        totalUsers,
        serviceProviders,
        totalBookings: totalBookings.length,
        platformRevenue: totalBookings.reduce((sum, b) => sum + b.price, 0)
      };
    }
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { service, carModel, date, time, providerId, price } = req.body;
    
    const newBooking = new Booking({
      clientId: req.user.id,
      providerId,
      service,
      carModel,
      date,
      time,
      status: 'pending',
      price: parseInt(price),
      location: 'Mumbai'
    });
    
    await newBooking.save();
    res.json({ success: true, booking: newBooking });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update booking status
app.put('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check permissions
    if (req.user.role === 'client' && booking.clientId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'provider' && booking.providerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    booking.status = status;
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚗 DriveConnect server running on http://localhost:${PORT}`);
  console.log(`📱 Client Dashboard: http://localhost:${PORT}/client-dashboard`);
  console.log(`🔧 Provider Dashboard: http://localhost:${PORT}/provider-dashboard`);
  console.log(`👨‍💼 Admin Dashboard: http://localhost:${PORT}/admin-dashboard`);
});