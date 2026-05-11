
const express = require('express');
const router = express.Router();

router.post('/email', (req, res) => {
    res.json({message: 'Notification sent'});
});

module.exports = router;
