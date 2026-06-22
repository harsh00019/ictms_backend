const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a player name'],
    trim: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Please select a team']
  },
  age: {
    type: Number,
    required: [true, 'Please add player age']
  },
  position: {
    type: String,
    required: [true, 'Please add player position/role'],
    trim: true
  },
  jerseyNumber: {
    type: Number,
    required: [true, 'Please add jersey number']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Player', PlayerSchema);
