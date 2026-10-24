import express from 'express';
import { getNotRelevant, setNotRelevant, syncNotRelevant } from '../controllers/notRelevantController.js';

const router = express.Router();

router.get('/', getNotRelevant);
router.post('/', setNotRelevant);
router.post('/sync', syncNotRelevant);

export default router;
