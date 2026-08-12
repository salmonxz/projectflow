const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachment.controller');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/tasks/:taskId/attachments', verifyToken, attachmentController.getTaskAttachments);
router.post('/tasks/:taskId/attachments', verifyToken, upload.single('file'), attachmentController.uploadAttachment);
router.delete('/attachments/:id', verifyToken, attachmentController.deleteAttachment);

module.exports = router;
