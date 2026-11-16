const express = require('express');
const router = express.Router();
const {
  createDoubt,
  getDoubts,
  getDoubtById,
  getMyDoubts,
  updateDoubtStatus,
  deleteDoubt,
} = require('../controllers/doubtController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getDoubts)
  .post(protect, createDoubt);

router.get('/user/my-doubts', protect, getMyDoubts);

router.route('/:id')
  .get(getDoubtById)
  .delete(protect, deleteDoubt);

router.patch('/:id/status', protect, updateDoubtStatus);

module.exports = router;
