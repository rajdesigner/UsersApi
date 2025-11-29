const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true          
  },  
  address: {
    type: String,
    required: false,
    trim: true
  }

}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;