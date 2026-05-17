const Meeting = require('../models/Meeting');

// Schedule a meeting
exports.scheduleMeeting = async (req, res) => {
  try {
    const { title, description, participant, date, startTime, endTime } = req.body;

    // Check for conflicts
    const conflict = await Meeting.findOne({
      participant,
      date,
      status: { $ne: 'cancelled' },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflict) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    const meeting = new Meeting({
      title,
      description,
      organizer: req.user.id,
      participant,
      date,
      startTime,
      endTime
    });

    await meeting.save();
    res.status(201).json(meeting);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all meetings for a user
exports.getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { organizer: req.user.id },
        { participant: req.user.id }
      ]
    })
    .populate('organizer', 'name email')
    .populate('participant', 'name email')
    .sort({ date: 1 });

    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Accept a meeting
exports.acceptMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    meeting.status = 'accepted';
    await meeting.save();
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reject a meeting
exports.rejectMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    meeting.status = 'rejected';
    await meeting.save();
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Cancel a meeting
exports.cancelMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    meeting.status = 'cancelled';
    await meeting.save();
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};