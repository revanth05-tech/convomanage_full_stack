const mongoose = require('mongoose');

const conferenceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: Date,
  endDate: Date,
  capacity: { type: Number, default: 100 },
  type: { type: String, default: 'other' },
  status: { type: String, default: 'planning' },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Conference', conferenceSchema);
