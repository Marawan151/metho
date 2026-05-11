const express = require('express');
const router = express.Router();

const registrationsController = require('../controllers/registrations.controller');
const requireAuth = require('../middleware/auth.middleware');

router.get('/mine', requireAuth, registrationsController.listMine);
router.get('/ref/:ref', requireAuth, registrationsController.getByRef);
router.post('/', requireAuth, registrationsController.create);

module.exports = router;
