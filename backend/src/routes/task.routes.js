const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { verifyToken, authorize } = require('../middleware/auth');

// Project-level task routes
router.get('/projects/:projectId/tasks', verifyToken, taskController.getProjectTasks);
router.post('/projects/:projectId/tasks', verifyToken, authorize('Project Manager'), taskController.createTask);
router.get('/projects/:projectId/suggest-members', verifyToken, taskController.suggestMembersForTask);

// Task-level routes
router.get('/tasks', verifyToken, taskController.getMyTasks);
router.post('/tasks', verifyToken, authorize('Project Manager'), taskController.createTask);
router.get('/tasks/:id', verifyToken, taskController.getTaskById);
router.put('/tasks/:id', verifyToken, authorize('Project Manager'), taskController.updateTask);
router.patch('/tasks/:id/status', verifyToken, taskController.updateTaskStatus);
router.delete('/tasks/:id', verifyToken, authorize('Project Manager'), taskController.deleteTask);

module.exports = router;
