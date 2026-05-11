const express = require('express');
const router = express.Router();

const eventsController = require('../controllers/events.controller');

router.get('/', eventsController.listPublished);
router.get('/s/:slug', eventsController.getBySlug);
router.get('/:id', eventsController.getById);

module.exports = router;
