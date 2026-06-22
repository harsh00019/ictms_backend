const express = require('express');
const {
  login,
  getMe,
  createCoordinator,
  getCoordinators,
  deleteCoordinator
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);

// Admin-only coordinator management
router.route('/coordinators')
  .post(protect, authorize('admin'), createCoordinator)
  .get(protect, authorize('admin'), getCoordinators);

router.delete('/coordinators/:id', protect, authorize('admin'), deleteCoordinator);

module.exports = router;
