

const express = require('express');
const router = express.Router();
const Attendee = require('../models/attendee');
const Conference = require('../models/conference');

// GET all attendees (render dashboard.ejs)
router.get('/', async (req, res) => {
  try {
    const attendees = await Attendee.find().populate('conference');
    const conferences = await Conference.find();
    res.render('dashboard', { attendees, conferences, success: '', error: '' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST new attendee
router.post('/', async (req, res) => {
  try {
    const { name, email, company, title, conference, ticketType } = req.body;
    const newAttendee = new Attendee({ name, email, company, title, conference, ticketType });
    await newAttendee.save();

    const attendees = await Attendee.find().populate('conference');
    const conferences = await Conference.find();

    res.render('dashboard', {
      attendees,
      conferences,
      success: '✅ Attendee Registered Successfully!',
      error: ''
    });
  } catch (err) {
    const attendees = await Attendee.find().populate('conference');
    const conferences = await Conference.find();

    res.render('dashboard', {
      attendees,
      conferences,
      success: '',
      error: '❌ Failed to register attendee!'
    });
  }
});

// DELETE attendee
router.post('/:id/delete', async (req, res) => {
  try {
    await Attendee.findByIdAndDelete(req.params.id);
    const attendees = await Attendee.find().populate('conference');
    const conferences = await Conference.find();

    res.render('dashboard', {
      attendees,
      conferences,
      success: '🗑 Attendee deleted successfully!',
      error: ''
    });
  } catch (err) {
    const attendees = await Attendee.find().populate('conference');
    const conferences = await Conference.find();

    res.render('dashboard', {
      attendees,
      conferences,
      success: '',
      error: '❌ Failed to delete attendee!'
    });
  }
});

module.exports = router;