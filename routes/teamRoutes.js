const express = require('express');
const {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getTeams)
  .post(protect, authorize('admin', 'coordinator'), createTeam);

router.route('/:id')
  .get(getTeam)
  .put(protect, authorize('admin', 'coordinator'), updateTeam)
  .delete(protect, authorize('admin', 'coordinator'), deleteTeam);

module.exports = router;
