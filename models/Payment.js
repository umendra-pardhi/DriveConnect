const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: {
    type: { type: String, enum: ['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet'], required: true },
    last4: { type: String },
    brand: { type: String },
    expiryMonth: { type: String },
    expiryYear: { type: String }
  },
  transactionId: { type: String },
  paymentGateway: { type: String },
  paymentDate: { type: Date },
  refundDetails: {
    amount: { type: Number },
    reason: { type: String },
    date: { type: Date },
    transactionId: { type: String }
  },
  billingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String }
  },
  metadata: {
    ipAddress: { type: String },
    userAgent: { type: String },
    risk_score: { type: Number }
  },
  receiptUrl: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);