const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/projects/:id/activity', verifyToken, activityController.getProjectActivities);
router.get('/activities', verifyToken, activityController.getAllActivities);

module.exports = router;
