const Transaction = require('../models/Transaction');

exports.deposit = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const transaction = new Transaction({
      user: req.user.id,
      type: 'deposit',
      amount,
      status: 'completed',
      description: description || 'Deposit'
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const transaction = new Transaction({
      user: req.user.id,
      type: 'withdrawal',
      amount,
      status: 'completed',
      description: description || 'Withdrawal'
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.transfer = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const transaction = new Transaction({
      user: req.user.id,
      type: 'transfer',
      amount,
      status: 'completed',
      description: description || 'Transfer'
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};