const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a college name'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Please add a unique college code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
    trim: true
  },
  contactEmail: {
    type: String,
    required: [true, 'Please add a contact email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid contact email'
    ],
    trim: true,
    lowercase: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('College', CollegeSchema);
