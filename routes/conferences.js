const express = require('express');
const router = express.Router();
const Conference = require('../models/conference');

// GET all conferences
router.get('/', async (req, res) => {
  try {
    const conferences = await Conference.find();
    res.json(conferences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new conference
router.post('/add', async (req, res) => {
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
    res.json({ success: true, message: 'Conference created successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET conference by ID
router.get('/:id', async (req, res) => {
  try {
    const conference = await Conference.findById(req.params.id);
    if (!conference) return res.status(404).json({ error: 'Conference not found' });
    res.json(conference);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE conference by ID
router.delete('/:id', async (req, res) => {
  try {
    await Conference.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Conference deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
