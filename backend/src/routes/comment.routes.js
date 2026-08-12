const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/tasks/:taskId/comments', verifyToken, commentController.getTaskComments);
router.post('/tasks/:taskId/comments', verifyToken, commentController.addComment);
router.put('/comments/:id', verifyToken, commentController.updateComment);
router.delete('/comments/:id', verifyToken, commentController.deleteComment);

module.exports = router;
