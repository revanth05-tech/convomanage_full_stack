const express = require('express');
const router = express.Router();
const Attendee = require('../models/attendee');
const Conference = require('../models/conference');

// ✅ GET attendee registration + list
router.get('/attendees', async (req, res) => {
  try {
    const attendees = await Attendee.find().populate('conference');
    const conferences = await Conference.find();
    res.render('dashboard', { attendees, conferences, success: req.flash('success'), error: req.flash('error') });
  } catch (err) {
    console.error('Attendee load error:', err);
    req.flash('error', 'Failed to load attendees!');
    res.redirect('/'); // main site home
  }
});

// ✅ POST new attendee with debug logs
router.post('/attendees', async (req, res) => {
  try {
    const { name, email, company, title, conference, ticketType } = req.body;

    console.log('Form data received:', req.body); // ✅ debug line

    const newAttendee = new Attendee({
      name,
      email,
      company,
      title,
      conference,
      ticketType
    });

    console.log('Attendee to save:', newAttendee); // ✅ debug line

    await newAttendee.save();

    req.flash('success', '✅ Attendee Registered Successfully!');
    res.redirect('/attendees');
  } catch (err) {
    console.error('Attendee save error:', err);
    req.flash('error', '❌ Failed to register attendee!');
    res.redirect('/attendees');
  }
});

// ✅ DELETE attendee
router.post('/attendees/:id/delete', async (req, res) => {
  try {
    await Attendee.findByIdAndDelete(req.params.id);
    req.flash('success', '🗑 Attendee deleted successfully!');
    res.redirect('/attendees');
  } catch (err) {
    console.error('Attendee delete error:', err);
    req.flash('error', '❌ Failed to delete attendee!');
    res.redirect('/attendees');
  }
});

module.exports = router;
