const express = require('express');
const {
  getColleges,
  getCollege,
  createCollege,
  updateCollege,
  deleteCollege
} = require('../controllers/collegeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getColleges)
  .post(protect, authorize('admin'), createCollege);

router.route('/:id')
  .get(getCollege)
  .put(protect, authorize('admin'), updateCollege)
  .delete(protect, authorize('admin'), deleteCollege);

module.exports = router;
