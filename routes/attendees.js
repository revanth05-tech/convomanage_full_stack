const express = require('express');
const router = express.Router();
const Attendee = require('../models/attendee');
const Conference = require('../models/conference'); // For populating conference dropdown

// GET all attendees (for table)
router.get('/', async (req, res) => {
  try {
    const attendees = await Attendee.find().populate('conference');
    res.json(attendees); // return JSON for frontend JS
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new attendee (form submission)
router.post('/add', async (req, res) => {
  try {
    const { name, email, company, title, conference, ticketType } = req.body;
    const newAttendee = new Attendee({
      name,
      email,
      company,
      title,
      conference,
      ticketType
    });
    await newAttendee.save();
    res.json({ success: true, message: 'Attendee registered successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Optional: GET attendee by ID
router.get('/:id', async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.id).populate('conference');
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' });
    res.json(attendee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optional: DELETE attendee
router.delete('/:id', async (req, res) => {
  try {
    await Attendee.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Attendee deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
