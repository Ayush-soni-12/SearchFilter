import express from 'express';
import { handleSearch, renewCache, pinCache, deleteCache } from '../controllers/searchController.js';

const router = express.Router();

router.get('/', handleSearch);
router.post('/cache/:id/renew', renewCache);
router.post('/cache/:id/pin', pinCache);
router.delete('/cache/:id', deleteCache);

export default router;
