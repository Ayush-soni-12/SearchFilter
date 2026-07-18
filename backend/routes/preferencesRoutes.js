import express from 'express';
import { getPreferences, updatePreference } from '../controllers/preferencesController.js';

const router = express.Router();

router.get('/', getPreferences);
router.post('/', updatePreference);

export default router;
