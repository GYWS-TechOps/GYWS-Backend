const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer();

const {  Mail } = require('../Controller/Mailer');
router.post('/', upload.any(), Mail);

module.exports = router;