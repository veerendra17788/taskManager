const express = require('express');
const router = express.Router();
const { getCurrentUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protected route to get the current user
router.get('/current', authMiddleware, getCurrentUser);

module.exports = router;
