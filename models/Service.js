const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['maintenance', 'repair', 'inspection', 'emergency', 'custom'], required: true },
  basePrice: { type: Number, required: true },
  estimatedDuration: { type: Number, required: true }, // in minutes
  vehicleTypes: [{ type: String }], // compatible vehicle types
  requirements: [{ type: String }], // special requirements or tools needed
  includedServices: [{ type: String }], // list of included sub-services
  warranty: {
    duration: { type: Number }, // in months
    mileage: { type: Number }, // warranty mileage limit
    terms: { type: String }
  },
  availability: {
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: true },
    saturday: { type: Boolean, default: true },
    sunday: { type: Boolean, default: false }
  },
  images: [{ type: String }], // URLs to service images
  isPopular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
serviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Service', serviceSchema);