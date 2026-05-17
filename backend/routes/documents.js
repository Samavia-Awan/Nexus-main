const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  addSignature
} = require('../controllers/documentController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|png|jpg|jpeg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

router.post('/upload', auth, upload.single('document'), uploadDocument);
router.get('/', auth, getDocuments);
router.get('/:id', auth, getDocument);
router.delete('/:id', auth, deleteDocument);
router.put('/:id/sign', auth, addSignature);

module.exports = router;