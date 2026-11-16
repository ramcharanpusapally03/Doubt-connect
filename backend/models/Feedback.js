const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    doubtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doubt',
      required: true,
      unique: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    helperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5 stars'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// After saving feedback, recalculate helper's average rating
feedbackSchema.post('save', async function () {
  try {
    const FeedbackModel = this.constructor;
    const UserModel = mongoose.model('User');

    const stats = await FeedbackModel.aggregate([
      { $match: { helperId: this.helperId } },
      {
        $group: {
          _id: '$helperId',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await UserModel.findByIdAndUpdate(this.helperId, {
        ratingAverage: Math.round(stats[0].averageRating * 10) / 10,
        ratingCount: stats[0].count,
      });
    }
  } catch (err) {
    console.error('Error updating helper rating stats:', err.message);
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
