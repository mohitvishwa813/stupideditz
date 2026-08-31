import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDbSchema } from './db.js';
import authRoutes from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Initialize Turso DB tables
initDbSchema();

// Mount Routes
app.use('/api/auth', authRoutes);

// Root & Health Check Endpoints
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: '🚀 Stupid Editz Backend Server is Live!', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Stupid Editz Backend API', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Stupid Editz Backend API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 [Node.js Express Server] Running on http://localhost:${PORT}`);
});
