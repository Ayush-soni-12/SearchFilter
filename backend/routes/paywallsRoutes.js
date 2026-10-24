import express from 'express';
import { getPaywalls, setPaywall, syncPaywalls } from '../controllers/paywallsController.js';

const router = express.Router();

router.get('/', getPaywalls);
router.post('/', setPaywall);
router.post('/sync', syncPaywalls);

export default router;
