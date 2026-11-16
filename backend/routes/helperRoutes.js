const express = require('express');
const router = express.Router();
const {
  getHelpers,
  getHelperById,
  getRecommendedHelpers,
} = require('../controllers/helperController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getHelpers);
router.get('/recommended/:doubtId', protect, getRecommendedHelpers);
router.get('/:id', getHelperById);

module.exports = router;
