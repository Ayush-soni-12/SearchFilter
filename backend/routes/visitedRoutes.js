import express from 'express';
import { getVisited, setVisited, syncVisited } from '../controllers/visitedController.js';

const router = express.Router();

router.get('/', getVisited);
router.post('/', setVisited);
router.post('/sync', syncVisited);

export default router;
