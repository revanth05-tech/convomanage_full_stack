const express = require('express');
const router = express.Router();
const Attendee = require('../models/attendee');
const Speaker = require('../models/speaker');
const Session = require('../models/session');
const Conference = require('../models/conference');

router.get('/attendees', async (req, res) => {
  try {
    const attendees = await Attendee.find().populate('conference').lean();
    const formattedAttendees = attendees.map(a => ({
      ...a,
      id: a._id.toString(),
      conference: a.conference ? a.conference._id.toString() : null
    }));
    res.json(formattedAttendees);
  } catch (err) {
    console.error('Error fetching attendees:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/attendees', async (req, res) => {
  try {
    const { name, email, company, title, conference, ticketType } = req.body;

    if (!name || !email || !conference) {
      return res.status(400).json({ error: 'Name, Email, and Conference are required!' });
    }

    const newAttendee = new Attendee({
      name,
      email,
      company,
      title,
      conference,
      ticketType: ticketType || 'standard',
      status: 'pending'
    });

    await newAttendee.save();
    res.status(201).json({ success: true, attendee: newAttendee });
  } catch (err) {
    console.error('Error creating attendee:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/attendees/:id', async (req, res) => {
  try {
    await Attendee.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting attendee:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/speakers', async (req, res) => {
  try {
    const speakers = await Speaker.find().lean();
    const formattedSpeakers = speakers.map(s => ({
      ...s,
      id: s._id.toString()
    }));
    res.json(formattedSpeakers);
  } catch (err) {
    console.error('Error fetching speakers:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/speakers', async (req, res) => {
  try {
    const { name, email, company, title, expertise, fee, bio } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required!' });
    }

    const newSpeaker = new Speaker({
      name,
      email,
      company,
      title,
      expertise,
      fee: fee || 0,
      bio
    });

    await newSpeaker.save();
    res.status(201).json({ success: true, speaker: newSpeaker });
  } catch (err) {
    console.error('Error creating speaker:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/speakers/:id', async (req, res) => {
  try {
    await Speaker.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting speaker:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('speaker')
      .populate('conference')
      .lean();
    const formattedSessions = sessions.map(s => ({
      ...s,
      id: s._id.toString(),
      speaker: s.speaker ? s.speaker._id.toString() : null,
      conference: s.conference ? s.conference._id.toString() : null
    }));
    res.json(formattedSessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const { title, speaker, conference, date, startTime, duration, description } = req.body;

    if (!title || !speaker || !conference || !date || !startTime) {
      return res.status(400).json({ error: 'Title, Speaker, Conference, Date, and Start Time are required!' });
    }

    const newSession = new Session({
      title,
      speaker,
      conference,
      date,
      startTime,
      duration: duration || 60,
      description
    });

    await newSession.save();
    res.status(201).json({ success: true, session: newSession });
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/sessions/:id', async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/conferences', async (req, res) => {
  try {
    const conferences = await Conference.find().lean();
    const formattedConferences = conferences.map(c => ({
      ...c,
      id: c._id.toString()
    }));
    res.json(formattedConferences);
  } catch (err) {
    console.error('Error fetching conferences:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/conferences', async (req, res) => {
  try {
    const { name, type, startDate, endDate, capacity, status, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Conference name is required!' });
    }

    const newConference = new Conference({
      name,
      type: type || 'other',
      startDate,
      endDate,
      capacity: capacity || 100,
      status: status || 'planning',
      description
    });

    await newConference.save();
    res.status(201).json({ success: true, conference: newConference });
  } catch (err) {
    console.error('Error creating conference:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/conferences/:id', async (req, res) => {
  try {
    await Conference.findByIdAndDelete(req.params.id);
    await Attendee.deleteMany({ conference: req.params.id });
    await Session.deleteMany({ conference: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting conference:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
