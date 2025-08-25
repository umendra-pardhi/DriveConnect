const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  serviceQuality: { type: Number, min: 1, max: 5 },
  punctuality: { type: Number, min: 1, max: 5 },
  professionalism: { type: Number, min: 1, max: 5 },
  photos: [{ type: String }], // URLs to review photos
  response: {
    comment: { type: String },
    date: { type: Date },
    isPublic: { type: Boolean, default: true }
  },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  isActive: { type: Boolean, default: true }
});

// Calculate average rating before saving
reviewSchema.pre('save', function(next) {
  const ratings = [
    this.serviceQuality || this.rating,
    this.punctuality || this.rating,
    this.professionalism || this.rating
  ];
  this.rating = ratings.reduce((a, b) => a + b) / ratings.length;
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Review', reviewSchema);