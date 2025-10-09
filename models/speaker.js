const mongoose = require('mongoose');

const speakerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  company: String,
  title: String,
  expertise: String,
  fee: { type: Number, default: 0 },
  bio: String
}, { timestamps: true });

module.exports = mongoose.model('Speaker', speakerSchema);
