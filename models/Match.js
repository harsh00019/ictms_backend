const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: [true, 'Please select a tournament']
  },
  team1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Please select Team 1']
  },
  team2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Please select Team 2']
  },
  matchDate: {
    type: Date,
    required: [true, 'Please set a match date and time']
  },
  venue: {
    type: String,
    required: [true, 'Please specify the venue'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Ongoing', 'Completed'],
    default: 'Scheduled'
  },
  score1: {
    type: Number,
    default: 0
  },
  score2: {
    type: Number,
    default: 0
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  isDraw: {
    type: Boolean,
    default: false
  },
  resultPublished: {
    type: Boolean,
    default: false
  },
  resultDetails: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', MatchSchema);
