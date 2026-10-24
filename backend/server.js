import express from 'express';
import cors from 'cors';
import searchRoutes from './routes/searchRoutes.js';
import preferencesRoutes from './routes/preferencesRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import bookmarksRoutes from './routes/bookmarksRoutes.js';
import ratingsRoutes from './routes/ratingsRoutes.js';
import paywallsRoutes from './routes/paywallsRoutes.js';
import visitedRoutes from './routes/visitedRoutes.js';
import notRelevantRoutes from './routes/notRelevantRoutes.js';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/search', searchRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/paywalls', paywallsRoutes);
app.use('/api/visited', visitedRoutes);
app.use('/api/not-relevant', notRelevantRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SearchFilter backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
