const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  speaker: { type: mongoose.Schema.Types.ObjectId, ref: 'Speaker' },
  conference: { type: mongoose.Schema.Types.ObjectId, ref: 'Conference' },
  date: Date,
  startTime: String,
  duration: Number,
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
