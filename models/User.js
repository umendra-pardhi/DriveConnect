const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['client', 'provider', 'admin'], default: 'client' },
  phone: { type: String, required: true },
  avatar: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  // Provider specific fields
  provider: {
    businessName: { type: String },
    businessLicense: { type: String },
    serviceArea: [{
      city: { type: String },
      state: { type: String },
      zipCode: { type: String }
    }],
    specializations: [{ type: String }],
    yearsOfExperience: { type: Number },
    certifications: [{
      name: { type: String },
      issuedBy: { type: String },
      issueDate: { type: Date },
      expiryDate: { type: Date },
      verificationUrl: { type: String }
    }],
    availability: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: false }
    },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  // Client specific fields
  client: {
    preferredServiceTypes: [{ type: String }],
    preferredProviders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    totalBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 }
  },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);