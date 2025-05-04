// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phoneNumber: String, // E.164 format, e.g. +919876543210
});

module.exports = mongoose.model('User', userSchema);
