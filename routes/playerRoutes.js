const express = require('express');
const {
  getPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer
} = require('../controllers/playerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getPlayers)
  .post(protect, authorize('admin', 'coordinator'), createPlayer);

router.route('/:id')
  .get(getPlayer)
  .put(protect, authorize('admin', 'coordinator'), updatePlayer)
  .delete(protect, authorize('admin', 'coordinator'), deletePlayer);

module.exports = router;
