// frontend/src/Login.jsx
import { useState } from 'react';
import axios from 'axios';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      setMessage(res.data.message || 'Login successful!');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'ERR_NETWORK') {
        setMessage('Cannot connect to server. Make sure your backend is running.');
      } else {
        setMessage(err.response?.data?.message || 'Something went wrong');
      }
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
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        /><br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        /><br />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
      {message && <p>{message}</p>}
      <button 
        onClick={testConnection} 
        disabled={loading}
        style={{ marginTop: '1rem' }}
      >
        Test Server Connection
      </button>
    </div>
  );
}

export default Login;