const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, projectController.getProjects);
router.get('/:id', verifyToken, projectController.getProjectById);
router.post('/', verifyToken, authorize('Project Manager'), projectController.createProject);
router.put('/:id', verifyToken, authorize('Project Manager'), projectController.updateProject);
router.delete('/:id', verifyToken, authorize('Project Manager'), projectController.deleteProject);

// Members sub-routes
router.get('/:id/members', verifyToken, projectController.getProjectMembers);
router.post('/:id/members', verifyToken, authorize('Project Manager'), projectController.addProjectMember);
router.delete('/:id/members/:userId', verifyToken, authorize('Project Manager'), projectController.removeProjectMember);

module.exports = router;
