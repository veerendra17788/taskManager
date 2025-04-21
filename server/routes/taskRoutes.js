const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middlewares/authMiddleware'); // your JWT middleware

router.post('/tasks', authenticate, taskController.createTask);
router.get('/tasks', authenticate, taskController.getAllTasks);
router.put('/tasks/:id', authenticate, taskController.updateTask);
router.delete('/tasks/:id', authenticate, taskController.deleteTask);
router.get('/tasks/overdue', authenticate, taskController.getOverdueTasks);

module.exports = router;
