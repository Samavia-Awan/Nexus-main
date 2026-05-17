const otpStore = {};

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;
    console.log(`OTP for ${email}: ${otp}`);
    setTimeout(() => delete otpStore[email], 5 * 60 * 1000);
    res.json({ message: 'OTP sent successfully', otp });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (otpStore[email] && otpStore[email] === otp) {
      delete otpStore[email];
      res.json({ message: 'OTP verified successfully', verified: true });
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP', verified: false });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};