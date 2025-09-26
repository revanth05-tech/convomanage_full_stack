
const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  company: { type: String, trim: true },
  title: { type: String, trim: true },
  conference: { type: mongoose.Schema.Types.ObjectId, ref: 'Conference', required: true },
  ticketType: { type: String, enum: ['standard', 'premium', 'vip'], default: 'standard' },
  status: { type: String, enum: ['confirmed', 'pending', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendee', attendeeSchema);