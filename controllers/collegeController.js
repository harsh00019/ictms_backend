const College = require('../models/College');

// @desc    Get all colleges (or search by name/code)
// @route   GET /api/colleges
// @access  Public
exports.getColleges = async (req, res, next) => {
  try {
    let query = {};

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = {
        $or: [
          { name: searchRegex },
          { code: searchRegex }
        ]
      };
    }

    const colleges = await College.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: colleges.length,
      data: colleges
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single college
// @route   GET /api/colleges/:id
// @access  Public
exports.getCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    res.status(200).json({
      success: true,
      data: college
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new college
// @route   POST /api/colleges
// @access  Private/Admin
exports.createCollege = async (req, res, next) => {
  try {
    const { name, code, logo, address, contactEmail } = req.body;

    const college = await College.create({
      name,
      code,
      logo,
      address,
      contactEmail
    });

    res.status(201).json({
      success: true,
      data: college
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update college
// @route   PUT /api/colleges/:id
// @access  Private/Admin
exports.updateCollege = async (req, res, next) => {
  try {
    let college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    college = await College.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: college
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete college
// @route   DELETE /api/colleges/:id
// @access  Private/Admin
exports.deleteCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    await College.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
