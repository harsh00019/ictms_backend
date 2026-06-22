const Match = require('../models/Match');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

// @desc    Get all matches
// @route   GET /api/matches
// @access  Public
exports.getMatches = async (req, res, next) => {
  try {
    let query = {};

    // Filters
    if (req.query.tournament) {
      query.tournament = req.query.tournament;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.resultPublished) {
      query.resultPublished = req.query.resultPublished === 'true';
    }

    const matches = await Match.find(query)
      .populate({
        path: 'team1',
        populate: { path: 'college', select: 'name code logo' }
      })
      .populate({
        path: 'team2',
        populate: { path: 'college', select: 'name code logo' }
      })
      .populate('tournament', 'name sport status')
      .populate('winner', 'name')
      .sort({ matchDate: 1 });

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single match details
// @route   GET /api/matches/:id
// @access  Public
exports.getMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate({
        path: 'team1',
        populate: { path: 'college', select: 'name code logo' }
      })
      .populate({
        path: 'team2',
        populate: { path: 'college', select: 'name code logo' }
      })
      .populate('tournament', 'name sport status venue')
      .populate('winner', 'name');

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule a match
// @route   POST /api/matches
// @access  Private/Admin
exports.createMatch = async (req, res, next) => {
  try {
    const { tournament, team1, team2, matchDate, venue } = req.body;

    // Prevent same team selection
    if (team1 === team2) {
      return res.status(400).json({
        success: false,
        message: 'Team 1 and Team 2 must be different teams'
      });
    }

    // Verify tournament exists
    const tourney = await Tournament.findById(tournament);
    if (!tourney) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    // Verify both teams exist
    const t1 = await Team.findById(team1);
    const t2 = await Team.findById(team2);
    if (!t1 || !t2) {
      return res.status(404).json({ success: false, message: 'One or both teams not found' });
    }

    // Verify teams are registered in this tournament
    if (t1.tournament.toString() !== tournament || t2.tournament.toString() !== tournament) {
      return res.status(400).json({
        success: false,
        message: 'Both teams must be registered in the specified tournament'
      });
    }

    const match = await Match.create({
      tournament,
      team1,
      team2,
      matchDate,
      venue
    });

    const populatedMatch = await Match.findById(match._id)
      .populate('team1', 'name')
      .populate('team2', 'name')
      .populate('tournament', 'name sport');

    res.status(201).json({
      success: true,
      data: populatedMatch
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update match details (venue, date, status)
// @route   PUT /api/matches/:id
// @access  Private/Admin
exports.updateMatch = async (req, res, next) => {
  try {
    let match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    // If changing teams, prevent same team
    if (req.body.team1 && req.body.team2 && req.body.team1 === req.body.team2) {
      return res.status(400).json({
        success: false,
        message: 'Team 1 and Team 2 must be different'
      });
    } else if (req.body.team1 && !req.body.team2 && req.body.team1 === match.team2.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Team 1 must be different from current Team 2'
      });
    } else if (req.body.team2 && !req.body.team1 && req.body.team2 === match.team1.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Team 2 must be different from current Team 1'
      });
    }

    match = await Match.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('team1', 'name').populate('team2', 'name');

    res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish match results
// @route   POST /api/matches/:id/result
// @access  Private/Admin
exports.publishResult = async (req, res, next) => {
  try {
    const { score1, score2, winner, isDraw, resultDetails } = req.body;
    let match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    // Verify winner is one of the teams if not a draw
    if (!isDraw && winner) {
      if (winner !== match.team1.toString() && winner !== match.team2.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Winner must be one of the competing teams'
        });
      }
    }

    match.score1 = score1 !== undefined ? score1 : match.score1;
    match.score2 = score2 !== undefined ? score2 : match.score2;
    match.isDraw = isDraw !== undefined ? isDraw : match.isDraw;
    match.winner = isDraw ? null : (winner || null);
    match.status = 'Completed';
    match.resultPublished = true;
    match.resultDetails = resultDetails || '';

    await match.save();

    const populatedMatch = await Match.findById(match._id)
      .populate('team1', 'name')
      .populate('team2', 'name')
      .populate('winner', 'name')
      .populate('tournament', 'name sport');

    res.status(200).json({
      success: true,
      data: populatedMatch
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete match
// @route   DELETE /api/matches/:id
// @access  Private/Admin
exports.deleteMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    await Match.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
