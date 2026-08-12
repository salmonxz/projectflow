const express = require('express');
const router = express.Router();
const positionController = require('../controllers/position.controller');
const { verifyToken, authorize } = require('../middleware/auth');

// Public route to fetch job positions (used in registration form and filters)
router.get('/', positionController.getPositions);

// Protected Administrator routes for managing job positions
router.post('/', verifyToken, authorize('Administrator'), positionController.createPosition);
router.put('/:id', verifyToken, authorize('Administrator'), positionController.updatePosition);
router.delete('/:id', verifyToken, authorize('Administrator'), positionController.deletePosition);

module.exports = router;
