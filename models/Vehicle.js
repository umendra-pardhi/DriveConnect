const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  licensePlate: { type: String, required: true, unique: true },
  color: { type: String, required: true },
  type: { type: String, enum: ['sedan', 'suv', 'hatchback', 'truck', 'van', 'other'], required: true },
  mileage: { type: Number },
  lastService: { type: Date },
  insuranceInfo: {
    provider: { type: String },
    policyNumber: { type: String },
    expiryDate: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);