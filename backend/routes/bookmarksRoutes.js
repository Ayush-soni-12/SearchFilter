import express from 'express';
import { getBookmarks, toggleBookmark, removeBookmark } from '../controllers/bookmarksController.js';

const router = express.Router();

router.get('/', getBookmarks);
router.post('/toggle', toggleBookmark);
router.post('/remove', removeBookmark);

export default router;
