// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const twilio = require('twilio');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
console.log(`Twilio phone number configured as: ${twilioPhone}`);
const client = twilio(accountSid, authToken);

// Flag to control whether to actually send SMS or just simulate
const ACTUALLY_SEND_SMS = true; // You have a valid Twilio phone number now

// Store OTPs (in a real app, use a database)
const otpStore = {};

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Send OTP route
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    console.log(`Received request to send OTP to: ${phoneNumber}`);
    console.log(`Using Twilio number: ${twilioPhone}`);

    // Check if the phone numbers match
    if (phoneNumber === twilioPhone) {
      console.log('ERROR: Phone numbers match! Cannot send to Twilio number.');
      return res.status(400).json({ 
        message: 'Cannot send OTP to the Twilio phone number. Please use a different phone number.' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Always log the OTP to console for development
    console.log(`📱 OTP for ${phoneNumber}: ${otp}`);
    
    // Store OTP (with 5-minute expiration)
    otpStore[phoneNumber] = {
      code: otp,
      expiry: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    if (ACTUALLY_SEND_SMS) {
      // Send OTP via Twilio
      console.log(`Attempting to send SMS from ${twilioPhone} to ${phoneNumber}`);
      await client.messages.create({
        body: `Hello this is your ${otp}. `,
        from: twilioPhone,
        to: phoneNumber
      });
      console.log(`SMS sent to ${phoneNumber}`);
    } else {
      // Simulate sending with a delay for testing
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`[DEV MODE] SMS sending simulated. Check console for OTP.`);
    }

    res.status(200).json({ 
      message: ACTUALLY_SEND_SMS 
        ? 'OTP sent successfully!' 
        : 'OTP generated successfully! Check server console for the code (Development mode)' 
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
    console.error('Error details:', error.details);
    
    // More user-friendly error messages
    if (error.code === 21211) {
      return res.status(400).json({ message: 'Invalid phone number format. Please include country code (e.g., +1234567890).' });
    } else if (error.code === 21608) {
      return res.status(400).json({ message: 'This number is unverified. For trial accounts, you need to verify numbers first in your Twilio console.' });
    } else if (error.code === 21266) {
      return res.status(400).json({ 
        message: 'Cannot send to the same number as your Twilio number. The number you entered matches your Twilio number.',
        details: `You tried to send to: ${phoneNumber}, Your Twilio number is: ${twilioPhone}`
      });
    } else if (error.code === 21659) {
      return res.status(400).json({ message: 'The "From" number is not a valid Twilio phone number. Please purchase a Twilio number from the console.' });
    }
    
    res.status(500).json({ 
      message: 'Failed to send OTP', 
      error: error.message 
    });
  }
});

// Verify OTP route (for future use)
app.post('/api/auth/verify-otp', (req, res) => {
  const { phoneNumber, otp } = req.body;
  
  if (!phoneNumber || !otp) {
    return res.status(400).json({ message: 'Phone number and OTP are required' });
  }

  const storedOTP = otpStore[phoneNumber];
  
  if (!storedOTP) {
    return res.status(400).json({ message: 'No OTP was sent to this number' });
  }

  if (Date.now() > storedOTP.expiry) {
    delete otpStore[phoneNumber];
    return res.status(400).json({ message: 'OTP has expired' });
  }

  if (storedOTP.code !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // OTP is valid
  delete otpStore[phoneNumber]; // Clear the OTP after successful verification
  res.status(200).json({ message: 'OTP verified successfully!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});