const Team = require('../models/Team');
const College = require('../models/College');
const Tournament = require('../models/Tournament');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
exports.getTeams = async (req, res, next) => {
  try {
    let query = {};

    // Filter by college or tournament if specified
    if (req.query.college) {
      query.college = req.query.college;
    }
    if (req.query.tournament) {
      query.tournament = req.query.tournament;
    }

    const teams = await Team.find(query)
      .populate('college', 'name code logo')
      .populate('tournament', 'name sport status');

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single team details
// @route   GET /api/teams/:id
// @access  Public
exports.getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('college', 'name code logo address contactEmail')
      .populate('tournament', 'name sport startDate endDate status venue');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new team
// @route   POST /api/teams
// @access  Private (Admin & Coordinator)
exports.createTeam = async (req, res, next) => {
  try {
    let { name, college, tournament } = req.body;

    // Enforce coordinator restrictions
    if (req.user.role === 'coordinator') {
      college = req.user.college.toString();
    } else if (!college) {
      return res.status(400).json({ success: false, message: 'Please specify a college' });
    }

    // Verify tournament exists
    const tourney = await Tournament.findById(tournament);
    if (!tourney) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    // Check if team already exists for this college in this tournament
    const existingTeam = await Team.findOne({ college, tournament });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'This college has already registered a team for this tournament'
      });
    }

    const team = await Team.create({
      name,
      college,
      tournament
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('college', 'name code')
      .populate('tournament', 'name sport');

    res.status(201).json({
      success: true,
      data: populatedTeam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update team details
// @route   PUT /api/teams/:id
// @access  Private (Admin & Coordinator)
exports.updateTeam = async (req, res, next) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Enforce coordinator restrictions
    if (req.user.role === 'coordinator' && team.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update teams from other colleges'
      });
    }

    // Update name
    team.name = req.body.name || team.name;
    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('college', 'name code')
      .populate('tournament', 'name sport');

    res.status(200).json({
      success: true,
      data: populatedTeam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin & Coordinator)
exports.deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Enforce coordinator restrictions
    if (req.user.role === 'coordinator' && team.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete teams from other colleges'
      });
    }

    await Team.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
