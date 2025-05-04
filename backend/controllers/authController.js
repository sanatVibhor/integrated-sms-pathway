// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const client = require('../twilioClient');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Send SMS
    await client.messages.create({
      body: `Hello ${user.name}, you just logged in to our app.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phoneNumber,
    });

    res.status(200).json({ message: 'Login successful, SMS sent.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
