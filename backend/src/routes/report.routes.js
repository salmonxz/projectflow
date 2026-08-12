const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/dashboard', verifyToken, reportController.getDashboardStats);
router.get('/workload', verifyToken, reportController.getWorkloadReport);
router.get('/overview', verifyToken, reportController.getWorkloadReport);

module.exports = router;
