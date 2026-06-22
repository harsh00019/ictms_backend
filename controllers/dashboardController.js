const College = require('../models/College');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');

// @desc    Get dashboard analytics stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalColleges = await College.countDocuments();
    const totalTournaments = await Tournament.countDocuments();
    const totalTeams = await Team.countDocuments();
    const totalPlayers = await Player.countDocuments();
    const totalMatches = await Match.countDocuments();

    // Query coordinator specific restrictions if coordinator is calling
    let coordinatorStats = {};
    if (req.user && req.user.role === 'coordinator' && req.user.college) {
      const collegeTeams = await Team.find({ college: req.user.college });
      const collegeTeamIds = collegeTeams.map(t => t._id);
      
      const myTeamsCount = collegeTeams.length;
      const myPlayersCount = await Player.countDocuments({ team: { $in: collegeTeamIds } });
      const myMatches = await Match.countDocuments({
        $or: [
          { team1: { $in: collegeTeamIds } },
          { team2: { $in: collegeTeamIds } }
        ]
      });

      coordinatorStats = {
        myTeams: myTeamsCount,
        myPlayers: myPlayersCount,
        myMatches
      };
    }

    // Recent results (limit 5)
    const recentMatches = await Match.find({ status: 'Completed', resultPublished: true })
      .populate('team1', 'name')
      .populate('team2', 'name')
      .populate('winner', 'name')
      .populate('tournament', 'name sport')
      .sort({ matchDate: -1 })
      .limit(5);

    // Upcoming matches (limit 5)
    const upcomingMatches = await Match.find({ status: { $in: ['Scheduled', 'Ongoing'] } })
      .populate('team1', 'name')
      .populate('team2', 'name')
      .populate('tournament', 'name sport')
      .sort({ matchDate: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalColleges,
        totalTournaments,
        totalTeams,
        totalPlayers,
        totalMatches,
        recentMatches,
        upcomingMatches,
        ...coordinatorStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dynamic leaderboard standings for a tournament
// @route   GET /api/dashboard/leaderboard/:tournamentId
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    // Get all teams in this tournament
    const teams = await Team.find({ tournament }).populate('college', 'name code logo');

    // Get all completed matches in this tournament
    const matches = await Match.find({
      tournament,
      status: 'Completed',
      resultPublished: true
    });

    // Calculate standings dynamically
    const standings = teams.map(team => {
      let played = 0;
      let won = 0;
      let lost = 0;
      let draw = 0;
      let scoreFor = 0;
      let scoreAgainst = 0;

      matches.forEach(match => {
        const isTeam1 = match.team1.toString() === team._id.toString();
        const isTeam2 = match.team2.toString() === team._id.toString();

        if (isTeam1 || isTeam2) {
          played++;
          
          const myScore = isTeam1 ? match.score1 : match.score2;
          const oppScore = isTeam1 ? match.score2 : match.score1;
          
          scoreFor += myScore;
          scoreAgainst += oppScore;

          if (match.isDraw) {
            draw++;
          } else if (match.winner && match.winner.toString() === team._id.toString()) {
            won++;
          } else {
            lost++;
          }
        }
      });

      const points = (won * 3) + (draw * 1);

      return {
        team: {
          _id: team._id,
          name: team.name,
          college: team.college
        },
        played,
        won,
        lost,
        draw,
        scoreFor,
        scoreAgainst,
        scoreDifference: scoreFor - scoreAgainst,
        points
      };
    });

    // Sort standings: Points desc -> Score Difference desc -> Wins desc -> Team Name asc
    standings.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (b.scoreDifference !== a.scoreDifference) {
        return b.scoreDifference - a.scoreDifference;
      }
      if (b.won !== a.won) {
        return b.won - a.won;
      }
      return a.team.name.localeCompare(b.team.name);
    });

    res.status(200).json({
      success: true,
      data: standings
    });
  } catch (error) {
    next(error);
  }
};
