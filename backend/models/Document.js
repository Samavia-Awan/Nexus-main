const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'signed', 'rejected'], default: 'pending' },
  version: { type: Number, default: 1 },
  signature: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);