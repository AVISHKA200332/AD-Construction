const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');
const ctrl = require('../Controllers/RoleOpsController');

// all require auth
router.use(auth);

// Site Manager endpoints
router.get('/sm/projects', requireRole('Site Manager'), ctrl.getSMProjects);
router.post('/sm/projects/add-supervisor', requireRole('Site Manager'), ctrl.addSupervisorToProject);

// Site Supervisor endpoints
router.get('/ss/projects', requireRole('Site Supervisor', 'Supervisor'), ctrl.getSSProjects);
router.post('/ss/tasks', requireRole('Site Supervisor', 'Supervisor'), ctrl.createTask);
router.get('/ss/tasks', requireRole('Site Supervisor', 'Supervisor'), ctrl.listMyTasks);
router.put('/ss/tasks/:id', requireRole('Site Supervisor', 'Supervisor'), ctrl.updateTask);

// Labor endpoints
router.get('/labor/tasks', requireRole('Labor'), ctrl.myAssignedTasks);
router.post('/labor/tasks/:id/complete', requireRole('Labor'), ctrl.completeTask);

// Client endpoints
router.get('/client/projects', requireRole('Client'), ctrl.clientProjects);

module.exports = router;
