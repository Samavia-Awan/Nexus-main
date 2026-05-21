const express = require('express');
const router = express.Router();
const Collaboration = require('../models/Collaboration');
const auth = require('../middleware/auth');

// Send collaboration request (investor → entrepreneur)
router.post('/', auth, async (req, res) => {
  try {
    const { entrepreneurId, message } = req.body;
    const existing = await Collaboration.findOne({
      investor: req.user.id,
      entrepreneur: entrepreneurId
    });
    if (existing) return res.status(400).json({ message: 'Request already sent' });

    const collab = new Collaboration({
      investor: req.user.id,
      entrepreneur: entrepreneurId,
      message
    });
    await collab.save();
    await collab.populate('investor', 'name email');
    await collab.populate('entrepreneur', 'name email');
    res.json(collab);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all requests for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const collabs = await Collaboration.find({
      $or: [{ investor: req.user.id }, { entrepreneur: req.user.id }]
    }).populate('investor', 'name email avatarUrl')
      .populate('entrepreneur', 'name email avatarUrl')
      .sort({ createdAt: -1 });
    res.json(collabs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT accept
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const collab = await Collaboration.findByIdAndUpdate(
      req.params.id, { status: 'accepted' }, { new: true }
    ).populate('investor', 'name email')
     .populate('entrepreneur', 'name email');
    res.json(collab);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT reject
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const collab = await Collaboration.findByIdAndUpdate(
      req.params.id, { status: 'rejected' }, { new: true }
    ).populate('investor', 'name email')
     .populate('entrepreneur', 'name email');
    res.json(collab);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE request
router.delete('/:id', auth, async (req, res) => {
  try {
    await Collaboration.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;