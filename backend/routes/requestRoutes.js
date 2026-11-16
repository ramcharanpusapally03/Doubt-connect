const express = require('express');
const router = express.Router();
const {
  sendRequest,
  getMyRequests,
  respondToRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendRequest);
router.get('/my-requests', protect, getMyRequests);
router.patch('/:id/respond', protect, respondToRequest);

module.exports = router;
