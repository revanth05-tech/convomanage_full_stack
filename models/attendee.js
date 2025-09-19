const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  company: String,
  title: String,
  conference: { type: mongoose.Schema.Types.ObjectId, ref: 'Conference' },
  ticketType: { type: String, default: 'standard' },
  status: { type: String, default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Attendee', attendeeSchema);
