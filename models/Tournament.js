const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a tournament name'],
    trim: true
  },
  sport: {
    type: String,
    required: [true, 'Please select a sport'],
    enum: ['Football', 'Cricket', 'Basketball', 'Volleyball', 'Badminton']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  venue: {
    type: String,
    required: [true, 'Please add a venue'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming'
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tournament', TournamentSchema);
