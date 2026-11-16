const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    studentId: {
      type: String,
      required: [true, 'Please provide your Student Registration ID'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your university email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    course: {
      type: String,
      default: 'B.Tech CSE',
      trim: true,
    },
    year: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    role: {
      type: String,
      enum: ['student', 'helper'],
      default: 'student',
    },
    subjects: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      enum: ['Available', 'Busy', 'Offline'],
      default: 'Available',
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    ratingAverage: {
      type: Number,
      default: 5.0,
      min: 1.0,
      max: 5.0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Method to remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

module.exports = mongoose.model('User', userSchema);
