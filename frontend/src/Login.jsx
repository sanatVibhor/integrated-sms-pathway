// frontend/src/Login.jsx
import { useState } from 'react';
import axios from 'axios';

function Login() {
  const [form, setForm] = useState({ 
    email: '', 
    password: '',
    phoneNumber: '' // Added phone number field
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // Send OTP via Twilio
      const res = await axios.post('http://localhost:5000/api/auth/send-otp', {
        phoneNumber: form.phoneNumber
      });
      
      setMessage(res.data.message);
      setOtpSent(true);
    } catch (err) {
      console.error('OTP sending error:', err);
      if (err.code === 'ERR_NETWORK') {
        setMessage('Cannot connect to server. Make sure your backend is running.');
      } else {
        setMessage(err.response?.data?.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        phoneNumber: form.phoneNumber,
        otp
      });
      
      setMessage(res.data.message);
      // Here you would typically set authentication state or redirect user
    } catch (err) {
      console.error('OTP verification error:', err);
      setMessage(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Test connection to backend
  const testConnection = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/test');
      setMessage(`Server connection test: ${res.data.message}`);
    } catch (err) {
      setMessage('Failed to connect to server. Is your backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login</h2>
      
      {!otpSent ? (
        // Step 1: Show login form with phone number to send OTP
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ padding: '0.5rem', width: '100%', maxWidth: '300px' }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={{ padding: '0.5rem', width: '100%', maxWidth: '300px' }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number (with country code)"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              style={{ padding: '0.5rem', width: '100%', maxWidth: '300px' }}
            />
            <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
              Format: +1234567890 (include country code)
            </small>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        // Step 2: Show OTP verification form
        <form onSubmit={handleVerifyOtp}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{ padding: '0.5rem', width: '100%', maxWidth: '300px' }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '0.5rem'
            }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          
          <button 
            type="button"
            onClick={() => setOtpSent(false)}
            style={{
              padding: '0.5rem 1rem',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back
          </button>
        </form>
      )}

      {message && (
        <p style={{ 
          marginTop: '1rem', 
          padding: '0.5rem', 
          background: message.includes('success') ? '#e8f5e9' : '#ffebee', 
          borderRadius: '4px' 
        }}>
          {message}
        </p>
      )}
      
      <button 
        onClick={testConnection} 
        disabled={loading}
        style={{ 
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: '#9E9E9E',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        Test Server Connection
      </button>
    </div>
  );
}

export default Login;