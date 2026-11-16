const Message = require('../models/Message');
const Doubt = require('../models/Doubt');

/**
 * @desc    Get message history for a doubt conversation
 * @route   GET /api/messages/:doubtId
 * @access  Private
 */
const getMessages = async (req, res, next) => {
  try {
    const { doubtId } = req.params;

    const doubt = await Doubt.findById(doubtId)
      .populate('postedBy', 'name studentId role')
      .populate('assignedHelper', 'name studentId role');

    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    // Check if user is part of this doubt (poster, assigned helper, or any helper)
    const messages = await Message.find({ doubtId })
      .populate('senderId', 'name studentId role')
      .populate('receiverId', 'name studentId role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      doubt,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message via REST API (fallback / direct)
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = async (req, res, next) => {
  try {
    const { doubtId, receiverId, message } = req.body;

    if (!doubtId || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Doubt ID and non-empty message are required.',
      });
    }

    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    // Determine receiver if not explicitly provided
    let recipientId = receiverId;
    if (!recipientId) {
      if (doubt.postedBy.toString() === req.user._id.toString()) {
        recipientId = doubt.assignedHelper;
      } else {
        recipientId = doubt.postedBy;
      }
    }

    if (!recipientId) {
      recipientId = req.user._id; // Fallback self
    }

    const newMsg = await Message.create({
      doubtId,
      senderId: req.user._id,
      receiverId: recipientId,
      message: message.trim(),
    });

    const populated = await Message.findById(newMsg._id)
      .populate('senderId', 'name studentId role')
      .populate('receiverId', 'name studentId role');

    // Notify room if socket.io is accessible from req.app
    const io = req.app.get('io');
    if (io) {
      io.to(`doubt_${doubtId}`).emit('receiveMessage', populated);
    }

    res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  sendMessage,
};
