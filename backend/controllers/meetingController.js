const Meeting = require('../models/Meeting');
exports.scheduleMeeting = async (req, res) => {
  try {
    const { title, description, participant, date, startTime, endTime } = req.body;

    const meetingData = {
      title,
      description,
      organizer: req.user.id,
      date,
      startTime,
      endTime
    };

    if (participant && participant.trim() !== '') {
      meetingData.participant = participant;
    }

    const meeting = new Meeting(meetingData);
    await meeting.save();
    res.status(201).json(meeting);
  } catch (err) {
    console.log('MEETING ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
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