const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getFeedbackForHelper,
  getFeedbackForDoubt,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitFeedback);
router.get('/helper/:helperId', getFeedbackForHelper);
router.get('/doubt/:doubtId', protect, getFeedbackForDoubt);

module.exports = router;
