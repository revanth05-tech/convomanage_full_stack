const express = require('express');
const router = express.Router();
const Conference = require('../models/conference');

router.get('/', async (req, res) => {
  try {
    const conferences = await Conference.find();
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json(conferences);
    }
    res.render('conferences', { conferences });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, startDate, endDate, capacity, status, description } = req.body;
    const newConference = new Conference({
      name,
      type,
      startDate,
      endDate,
      capacity,
      status,
      description
    });
    await newConference.save();
    res.redirect('/conferences');
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const conference = await Conference.findById(req.params.id);
    if (!conference) return res.status(404).json({ error: 'Conference not found' });
    res.json(conference);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/delete', async (req, res) => {
  try {
    await Conference.findByIdAndDelete(req.params.id);
    res.redirect('/conferences');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
