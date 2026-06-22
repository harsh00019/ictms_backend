const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a team name'],
    trim: true
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: [true, 'Please select a college']
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: [true, 'Please select a tournament']
  }
}, {
  timestamps: true
});

// Set compound unique index to prevent a college from registering multiple teams in a single tournament
TeamSchema.index({ college: 1, tournament: 1 }, { unique: true });

module.exports = mongoose.model('Team', TeamSchema);
