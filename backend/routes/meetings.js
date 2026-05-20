const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');

// GET all meetings
router.get('/', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ organizer: req.user.id }, { participant: req.user.id }]
    }).populate('organizer', 'name email')
      .populate('participant', 'name email')
      .sort({ date: -1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create meeting
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, participantId } = req.body;
    const meeting = new Meeting({
      title,
      description,
      date,
      startTime,
      endTime,
      organizer: req.user.id,
      participant: participantId || null
    });
    await meeting.save();
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT accept
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id, { status: 'accepted' }, { new: true }
    );
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT reject
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id, { status: 'rejected' }, { new: true }
    );
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;