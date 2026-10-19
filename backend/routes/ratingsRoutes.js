import express from 'express';
import { getRatings, setRating, syncRatings } from '../controllers/ratingsController.js';

const router = express.Router();

router.get('/', getRatings);
router.post('/', setRating);
router.post('/sync', syncRatings);

export default router;
