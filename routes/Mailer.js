import { Router } from 'express';
import multer from 'multer';

const router = Router();
const upload = multer();

import { Mail } from '../Controller/Mailer.js';
router.post('/', upload.any(), Mail);

export default router;