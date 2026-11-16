const User = require('../models/User');
const Doubt = require('../models/Doubt');
const Feedback = require('../models/Feedback');

/**
 * @desc    Get all peer helpers with filters (subject, availability)
 * @route   GET /api/helpers
 * @access  Public (or Private)
 */
const getHelpers = async (req, res, next) => {
  try {
    const { subject, availability, q } = req.query;

    const filter = { role: 'helper' };

    if (availability && availability !== 'All') {
      filter.availability = availability;
    }

    if (subject && subject !== 'All') {
      filter.subjects = { $regex: new RegExp(subject, 'i') };
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { subjects: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
      ];
    }

    const helpers = await User.find(filter)
      .select('-passwordHash')
      .sort({ ratingAverage: -1, ratingCount: -1 });

    // Attach resolved count for each helper
    const helpersWithStats = await Promise.all(
      helpers.map(async (helper) => {
        const resolvedCount = await Doubt.countDocuments({
          assignedHelper: helper._id,
          status: 'Resolved',
        });
        const activeCount = await Doubt.countDocuments({
          assignedHelper: helper._id,
          status: 'In-Progress',
        });
        return {
          ...helper.toObject(),
          resolvedCount,
          activeCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: helpersWithStats.length,
      helpers: helpersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single helper profile with feedback and resolved doubts
 * @route   GET /api/helpers/:id
 * @access  Public (or Private)
 */
const getHelperById = async (req, res, next) => {
  try {
    const helper = await User.findOne({ _id: req.params.id, role: 'helper' }).select('-passwordHash');

    if (!helper) {
      return res.status(404).json({ success: false, message: 'Peer helper not found' });
    }

    const feedbacks = await Feedback.find({ helperId: helper._id })
      .populate('studentId', 'name studentId course')
      .populate('doubtId', 'title subject courseCode')
      .sort({ createdAt: -1 });

    const resolvedDoubts = await Doubt.find({
      assignedHelper: helper._id,
      status: 'Resolved',
    }).select('title subject courseCode topic resolvedAt');

    res.status(200).json({
      success: true,
      helper,
      feedbacks,
      resolvedDoubts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recommended helpers for a specific doubt based on subject match
 * @route   GET /api/helpers/recommended/:doubtId
 * @access  Private
 */
const getRecommendedHelpers = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.doubtId);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    // Match helpers teaching this subject or with available status
    const subjectRegex = new RegExp(doubt.subject, 'i');
    let helpers = await User.find({
      role: 'helper',
      subjects: { $regex: subjectRegex },
    }).select('-passwordHash').sort({ ratingAverage: -1 });

    // If no exact match, fallback to available helpers
    if (helpers.length === 0) {
      helpers = await User.find({
        role: 'helper',
        availability: 'Available',
      }).select('-passwordHash').limit(5);
    }

    res.status(200).json({
      success: true,
      doubtSubject: doubt.subject,
      helpers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHelpers,
  getHelperById,
  getRecommendedHelpers,
};
