const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'doubtconnect_super_secret_jwt_key_2026_lpu';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn });
};

/**
 * @desc    Register a new student or peer helper
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, studentId, email, password, course, year, role, subjects, bio } = req.body;

    if (!name || !studentId || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, Student ID, Email, and Password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check existing email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Check existing student ID
    const existingStudentId = await User.findOne({ studentId: studentId.toUpperCase() });
    if (existingStudentId) {
      return res.status(400).json({
        success: false,
        message: 'An account with this Student ID already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Format subjects
    let subjectsList = [];
    if (subjects) {
      if (Array.isArray(subjects)) {
        subjectsList = subjects;
      } else if (typeof subjects === 'string') {
        subjectsList = subjects.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    const user = await User.create({
      name,
      studentId: studentId.toUpperCase(),
      email: email.toLowerCase(),
      passwordHash,
      course: course || 'B.Tech CSE',
      year: year ? parseInt(year, 10) : 3,
      role: role === 'helper' ? 'helper' : 'student',
      subjects: subjectsList,
      bio: bio || '',
      availability: 'Available',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No user found with this email.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile details, subjects, availability
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, course, year, subjects, availability, bio } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (course) user.course = course;
    if (year) user.year = parseInt(year, 10);
    if (bio !== undefined) user.bio = bio;
    if (availability && ['Available', 'Busy', 'Offline'].includes(availability)) {
      user.availability = availability;
    }

    if (subjects !== undefined) {
      if (Array.isArray(subjects)) {
        user.subjects = subjects;
      } else if (typeof subjects === 'string') {
        user.subjects = subjects.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
