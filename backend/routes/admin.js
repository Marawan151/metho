const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const requireAuth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/roles.middleware');

router.get('/overview', requireAuth, requireRole('admin'), adminController.getOverview);
router.get('/events', requireAuth, requireRole('admin'), adminController.listEventsAdmin);
router.post('/events', requireAuth, requireRole('admin'), adminController.createEvent);
router.put('/events/:id', requireAuth, requireRole('admin'), adminController.updateEvent);
router.delete('/events/:id', requireAuth, requireRole('admin'), adminController.deleteEvent);

module.exports = router;
