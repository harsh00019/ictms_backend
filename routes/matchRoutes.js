const express = require('express');
const {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  publishResult,
  deleteMatch
} = require('../controllers/matchController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getMatches)
  .post(protect, authorize('admin'), createMatch);

router.route('/:id')
  .get(getMatch)
  .put(protect, authorize('admin'), updateMatch)
  .delete(protect, authorize('admin'), deleteMatch);

router.post('/:id/result', protect, authorize('admin'), publishResult);

module.exports = router;
