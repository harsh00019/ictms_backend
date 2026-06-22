const express = require('express');
const { getDashboardStats, getLeaderboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/leaderboard/:tournamentId', getLeaderboard);

module.exports = router;
