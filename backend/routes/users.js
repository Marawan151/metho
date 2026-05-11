const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users.controller');
const requireAuth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/roles.middleware');

router.get('/', requireAuth, requireRole('admin'), usersController.getUsers);

module.exports = router;
