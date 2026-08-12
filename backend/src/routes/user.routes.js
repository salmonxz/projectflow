const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, userController.getUsers);
router.get('/:id', verifyToken, userController.getUserById);
router.post('/', verifyToken, authorize('Administrator'), userController.createUser);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, authorize('Administrator'), userController.deleteUser);

module.exports = router;
