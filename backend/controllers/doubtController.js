const Doubt = require('../models/Doubt');
const User = require('../models/User');

/**
 * @desc    Create a new doubt
 * @route   POST /api/doubts
 * @access  Private
 */
const createDoubt = async (req, res, next) => {
  try {
    const { title, description, subject, courseCode, topic, priority } = req.body;

    if (!title || !description || !subject || !courseCode || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, subject, course code, and topic.',
      });
    }

    const doubt = await Doubt.create({
      title,
      description,
      subject,
      courseCode: courseCode.toUpperCase(),
      topic,
      priority: priority || 'Medium',
      postedBy: req.user._id,
      status: 'Open',
    });

    const populatedDoubt = await Doubt.findById(doubt._id).populate(
      'postedBy',
      'name studentId course year role'
    );

    res.status(201).json({
      success: true,
      message: 'Doubt posted successfully!',
      doubt: populatedDoubt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all doubts with search and filters
 * @route   GET /api/doubts
 * @access  Public (or Private)
 */
const getDoubts = async (req, res, next) => {
  try {
    const { q, subject, courseCode, status, priority, sort } = req.query;

    const filter = {};

    if (subject && subject !== 'All') {
      filter.subject = new RegExp(`^${subject}$`, 'i');
    }

    if (courseCode) {
      filter.courseCode = new RegExp(courseCode, 'i');
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { topic: { $regex: q, $options: 'i' } },
        { courseCode: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
      ];
    }

    let query = Doubt.find(filter)
      .populate('postedBy', 'name studentId course year role')
      .populate('assignedHelper', 'name studentId course year ratingAverage ratingCount availability');

    // Sorting
    if (sort === 'oldest') {
      query = query.sort({ createdAt: 1 });
    } else if (sort === 'priority') {
      // Sort priority in memory or map
      query = query.sort({ createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const doubts = await query;

    res.status(200).json({
      success: true,
      count: doubts.length,
      doubts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single doubt by ID
 * @route   GET /api/doubts/:id
 * @access  Public (or Private)
 */
const getDoubtById = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
      .populate('postedBy', 'name studentId course year role email')
      .populate('assignedHelper', 'name studentId course year ratingAverage ratingCount availability bio');

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found',
      });
    }

    res.status(200).json({
      success: true,
      doubt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get doubts posted by current user or assigned to current user
 * @route   GET /api/doubts/user/my-doubts
 * @access  Private
 */
const getMyDoubts = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const postedDoubts = await Doubt.find({ postedBy: userId })
      .populate('assignedHelper', 'name studentId ratingAverage ratingCount availability')
      .sort({ createdAt: -1 });

    const assignedDoubts = await Doubt.find({ assignedHelper: userId })
      .populate('postedBy', 'name studentId course year')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      postedDoubts,
      assignedDoubts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update doubt status (Open, In-Progress, Resolved)
 * @route   PATCH /api/doubts/:id/status
 * @access  Private
 */
const updateDoubtStatus = async (req, res, next) => {
  try {
    const { status, assignedHelper } = req.body;
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    // Permission check: only poster or assigned helper can update status
    const isPoster = doubt.postedBy.toString() === req.user._id.toString();
    const isHelper = doubt.assignedHelper && doubt.assignedHelper.toString() === req.user._id.toString();

    if (!isPoster && !isHelper && req.user.role !== 'helper') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this doubt.',
      });
    }

    if (status) {
      doubt.status = status;
      if (status === 'Resolved') {
        doubt.resolvedAt = new Date();
      }
    }

    if (assignedHelper !== undefined) {
      doubt.assignedHelper = assignedHelper || null;
    }

    await doubt.save();

    const updated = await Doubt.findById(doubt._id)
      .populate('postedBy', 'name studentId')
      .populate('assignedHelper', 'name studentId ratingAverage');

    res.status(200).json({
      success: true,
      message: `Doubt marked as ${doubt.status}!`,
      doubt: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete doubt
 * @route   DELETE /api/doubts/:id
 * @access  Private
 */
const deleteDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    if (doubt.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete doubts posted by yourself.',
      });
    }

    await doubt.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Doubt deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoubt,
  getDoubts,
  getDoubtById,
  getMyDoubts,
  updateDoubtStatus,
  deleteDoubt,
};
