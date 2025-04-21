const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
