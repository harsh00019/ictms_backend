const User = require('../models/User');
const College = require('../models/College');
const jwt = require('jsonwebtoken');

// Helper to sign JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ictms_super_secret_jwt_key_98765', {
    expiresIn: '30d'
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create token
    const token = generateToken(user._id);

    // Get user without password for response
    const userResponse = await User.findById(user._id).populate('college', 'name code');

    res.status(200).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('college', 'name code');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new coordinator (Admin only)
// @route   POST /api/auth/coordinators
// @access  Private/Admin
exports.createCoordinator = async (req, res, next) => {
  try {
    const { name, email, password, collegeId } = req.body;

    // Check if college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role: 'coordinator',
      college: collegeId
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: collegeId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coordinators (Admin only)
// @route   GET /api/auth/coordinators
// @access  Private/Admin
exports.getCoordinators = async (req, res, next) => {
  try {
    const coordinators = await User.find({ role: 'coordinator' }).populate('college', 'name code');
    res.status(200).json({
      success: true,
      count: coordinators.length,
      data: coordinators
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coordinator (Admin only)
// @route   DELETE /api/auth/coordinators/:id
// @access  Private/Admin
exports.deleteCoordinator = async (req, res, next) => {
  try {
    const coordinator = await User.findById(req.params.id);
    if (!coordinator) {
      return res.status(404).json({ success: false, message: 'Coordinator not found' });
    }

    if (coordinator.role !== 'coordinator') {
      return res.status(400).json({ success: false, message: 'Cannot delete non-coordinator users via this route' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
