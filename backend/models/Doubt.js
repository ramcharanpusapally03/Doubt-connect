const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a clear doubt title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed question / description of your doubt'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    courseCode: {
      type: String,
      required: [true, 'Course Code is required (e.g. INT335, CSE316)'],
      trim: true,
      uppercase: true,
    },
    topic: {
      type: String,
      required: [true, 'Specific topic is required (e.g. Prototype Testing, Paging)'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedHelper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Open', 'In-Progress', 'Resolved'],
      default: 'Open',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
doubtSchema.index({ title: 'text', description: 'text', topic: 'text', courseCode: 'text' });

module.exports = mongoose.model('Doubt', doubtSchema);
