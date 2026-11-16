const HelpRequest = require('../models/HelpRequest');
const Doubt = require('../models/Doubt');
const Message = require('../models/Message');

/**
 * @desc    Send a help request to a peer helper
 * @route   POST /api/requests
 * @access  Private
 */
const sendRequest = async (req, res, next) => {
  try {
    const { doubtId, helperId, message } = req.body;

    if (!doubtId || !helperId) {
      return res.status(400).json({
        success: false,
        message: 'Doubt ID and Helper ID are required.',
      });
    }

    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found.' });
    }

    // Check if user is the poster of the doubt
    if (doubt.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only request help for your own doubts.',
      });
    }

    // Check if an active request already exists for this doubt & helper
    const existing = await HelpRequest.findOne({
      doubtId,
      helperId,
      requestStatus: { $in: ['Pending', 'Accepted'] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A request to this helper is already ${existing.requestStatus.toLowerCase()}.`,
      });
    }

    const request = await HelpRequest.create({
      doubtId,
      studentId: req.user._id,
      helperId,
      message: message || 'Hello! Could you please guide me on this doubt?',
      requestStatus: 'Pending',
    });

    const populated = await HelpRequest.findById(request._id)
      .populate('doubtId', 'title subject courseCode topic priority')
      .populate('helperId', 'name studentId ratingAverage')
      .populate('studentId', 'name studentId course');

    res.status(201).json({
      success: true,
      message: 'Help request sent to peer helper successfully!',
      request: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's help requests (incoming for helpers, outgoing for students)
 * @route   GET /api/requests/my-requests
 * @access  Private
 */
const getMyRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const incoming = await HelpRequest.find({ helperId: userId })
      .populate('doubtId')
      .populate('studentId', 'name studentId course year email')
      .sort({ createdAt: -1 });

    const outgoing = await HelpRequest.find({ studentId: userId })
      .populate('doubtId')
      .populate('helperId', 'name studentId course year ratingAverage availability')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      incoming,
      outgoing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Helper responds to request (Accept or Reject)
 * @route   PATCH /api/requests/:id/respond
 * @access  Private (Helper)
 */
const respondToRequest = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Accepted' or 'Rejected'

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Accepted or Rejected',
      });
    }

    const request = await HelpRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    if (request.helperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the requested peer helper can respond.',
      });
    }

    request.requestStatus = status;
    await request.save();

    if (status === 'Accepted') {
      // Update doubt to In-Progress and assign helper
      await Doubt.findByIdAndUpdate(request.doubtId, {
        status: 'In-Progress',
        assignedHelper: req.user._id,
      });

      // Insert welcoming chat message
      await Message.create({
        doubtId: request.doubtId,
        senderId: req.user._id,
        receiverId: request.studentId,
        message: `Hello! I have accepted your help request. I am here to help you resolve this doubt!`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Help request ${status.toLowerCase()} successfully!`,
      request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendRequest,
  getMyRequests,
  respondToRequest,
};
