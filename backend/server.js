import express from 'express';
import cors from 'cors';
import searchRoutes from './routes/searchRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/search', searchRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SearchFilter backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
