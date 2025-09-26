
const express = require('express');
const router = express.Router();
const Attendee = require('../models/attendee');
const Conference = require('../models/conference');

// GET all attendees (render EJS)
router.get('/', async (req, res) => {
  try {
    const attendees = await Attendee.find().populate('conference');
    const conferences = await Conference.find(); // for dropdown
    res.render('attendees', { attendees, conferences });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST new attendee (form submission)
router.post('/', async (req, res) => {
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
    res.redirect('/attendees'); // after success go back to list
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;