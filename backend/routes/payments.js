const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  deposit,
  withdraw,
  transfer,
  getTransactions
} = require('../controllers/paymentController');

router.post('/deposit', auth, deposit);
router.post('/withdraw', auth, withdraw);
router.post('/transfer', auth, transfer);
router.get('/transactions', auth, getTransactions);

module.exports = router;