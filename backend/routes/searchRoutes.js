import express from 'express';
import { handleSearch } from '../controllers/searchController.js';

const router = express.Router();

router.get('/', handleSearch);

export default router;
