const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/users', adminController.getAllUsers);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;