const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: [
    'booking_created',
    'booking_confirmed',
    'booking_cancelled',
    'booking_completed',
    'payment_received',
    'payment_failed',
    'review_received',
    'service_reminder',
    'profile_update',
    'system_alert'
  ], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedTo: {
    model: { type: String, enum: ['Booking', 'Payment', 'Review', 'Service', 'User'] },
    id: { type: mongoose.Schema.Types.ObjectId }
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  channels: [{
    type: { type: String, enum: ['email', 'sms', 'push', 'in_app'], required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed', 'delivered', 'read'], default: 'pending' },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    error: { type: String }
  }],
  metadata: {
    actionUrl: { type: String },
    imageUrl: { type: String },
    additionalData: { type: mongoose.Schema.Types.Mixed }
  },
  expiresAt: { type: Date },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp and set readAt when isRead is changed to true
notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);