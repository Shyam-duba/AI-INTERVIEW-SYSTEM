const express = require('express');
const router = express.Router();
const { sendMailController } = require('../controllers/mailController');

router.post('/send', sendMailController);

module.exports = router;
