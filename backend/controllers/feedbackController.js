const Feedback = require('../models/Feedback');
const Doubt = require('../models/Doubt');
const User = require('../models/User');

/**
 * @desc    Submit rating and feedback for a resolved doubt
 * @route   POST /api/feedback
 * @access  Private (Student)
 */
const submitFeedback = async (req, res, next) => {
  try {
    const { doubtId, rating, comment } = req.body;

    if (!doubtId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Doubt ID and star rating (1-5) are required.',
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5.',
      });
    }

    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found.' });
    }

    if (doubt.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the student who posted the doubt can provide feedback.',
      });
    }

    if (!doubt.assignedHelper) {
      return res.status(400).json({
        success: false,
        message: 'No peer helper was assigned to this doubt.',
      });
    }

    // Check if feedback already submitted
    let existing = await Feedback.findOne({ doubtId });
    if (existing) {
      existing.rating = numRating;
      existing.comment = comment || '';
      await existing.save();

      return res.status(200).json({
        success: true,
        message: 'Feedback updated successfully!',
        feedback: existing,
      });
    }

    const feedback = await Feedback.create({
      doubtId,
      studentId: req.user._id,
      helperId: doubt.assignedHelper,
      rating: numRating,
      comment: comment || '',
    });

    // Mark doubt as Resolved if not already
    if (doubt.status !== 'Resolved') {
      doubt.status = 'Resolved';
      doubt.resolvedAt = new Date();
      await doubt.save();
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback and rating have been recorded.',
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all feedback for a helper
 * @route   GET /api/feedback/helper/:helperId
 * @access  Public (or Private)
 */
const getFeedbackForHelper = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ helperId: req.params.helperId })
      .populate('studentId', 'name studentId course')
      .populate('doubtId', 'title subject courseCode')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get feedback for a specific doubt
 * @route   GET /api/feedback/doubt/:doubtId
 * @access  Private
 */
const getFeedbackForDoubt = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ doubtId: req.params.doubtId })
      .populate('studentId', 'name')
      .populate('helperId', 'name');

    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  getFeedbackForHelper,
  getFeedbackForDoubt,
};
