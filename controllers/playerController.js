const Player = require('../models/Player');
const Team = require('../models/Team');

// @desc    Get all players (can filter by team)
// @route   GET /api/players
// @access  Public
exports.getPlayers = async (req, res, next) => {
  try {
    let query = {};

    if (req.query.team) {
      query.team = req.query.team;
    }

    const players = await Player.find(query)
      .populate({
        path: 'team',
        populate: [
          { path: 'college', select: 'name code' },
          { path: 'tournament', select: 'name sport' }
        ]
      })
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: players.length,
      data: players
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single player details
// @route   GET /api/players/:id
// @access  Public
exports.getPlayer = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate({
        path: 'team',
        populate: [
          { path: 'college', select: 'name code' },
          { path: 'tournament', select: 'name sport' }
        ]
      });

    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    res.status(200).json({
      success: true,
      data: player
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a player to a team
// @route   POST /api/players
// @access  Private (Admin & Coordinator)
exports.createPlayer = async (req, res, next) => {
  try {
    const { name, team: teamId, age, position, jerseyNumber } = req.body;

    // Verify team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Enforce coordinator restrictions
    if (req.user.role === 'coordinator' && team.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add players to teams of other colleges'
      });
    }

    const player = await Player.create({
      name,
      team: teamId,
      age,
      position,
      jerseyNumber
    });

    const populatedPlayer = await Player.findById(player._id).populate('team', 'name');

    res.status(201).json({
      success: true,
      data: populatedPlayer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update player details
// @route   PUT /api/players/:id
// @access  Private (Admin & Coordinator)
exports.updatePlayer = async (req, res, next) => {
  try {
    let player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    // If changing team, verify new team exists
    if (req.body.team) {
      const newTeam = await Team.findById(req.body.team);
      if (!newTeam) {
        return res.status(404).json({ success: false, message: 'New team not found' });
      }

      // Enforce coordinator restrictions for new team
      if (req.user.role === 'coordinator' && newTeam.college.toString() !== req.user.college.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only assign players to teams of your own college'
        });
      }
    }

    // Enforce coordinator restrictions for current player team
    const currentPlayerTeam = await Team.findById(player.team);
    if (req.user.role === 'coordinator' && currentPlayerTeam.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update players of other colleges'
      });
    }

    player = await Player.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('team', 'name');

    res.status(200).json({
      success: true,
      data: player
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete player
// @route   DELETE /api/players/:id
// @access  Private (Admin & Coordinator)
exports.deletePlayer = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    // Enforce coordinator restrictions
    const playerTeam = await Team.findById(player.team);
    if (req.user.role === 'coordinator' && playerTeam.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete players of other colleges'
      });
    }

    await Player.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
