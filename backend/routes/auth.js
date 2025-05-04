// backend/routes/auth.js - TEMPORARY MOCK VERSION
const express = require('express');
const router = express.Router();

// Mock user database (for development only)
const mockUsers = [
  { 
    id: '1', 
    email: 'test@example.com', 
    password: 'password123',
    name: 'Test User' 
  },
  { 
    id: '2', 
    email: 'admin@example.com', 
    password: 'admin123',
    name: 'Admin User' 
  }
];

// Mock login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Log request for debugging
  console.log('Login attempt:', { email, password: '***' });
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Find user in mock database
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  if (user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  // Don't send password in response
  const { password: _, ...userWithoutPassword } = user;
  
  res.status(200).json({ 
    message: 'Login successful (DEVELOPMENT MODE)', 
    user: userWithoutPassword,
    token: 'mock-jwt-token-' + user.id // Mock token
  });
});

// Mock register endpoint
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }
  
  // Create new mock user
  const newUser = {
    id: String(mockUsers.length + 1),
    name,
    email,
    password
  };
  
  // Add to mock database
  mockUsers.push(newUser);
  
  // Don't send password in response
  const { password: _, ...userWithoutPassword } = newUser;
  
  res.status(201).json({
    message: 'User registered successfully (DEVELOPMENT MODE)',
    user: userWithoutPassword
  });
});

// Get current user (protected route - would usually require auth middleware)
router.get('/me', (req, res) => {
  res.status(200).json({ 
    message: 'Mock user data retrieved',
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }
  });
});

// Testing endpoint
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Auth route is working!' });
});

module.exports = router;