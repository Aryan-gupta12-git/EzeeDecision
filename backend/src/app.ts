import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import decisionRoutes from './routes/decision.routes.js';

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', decisionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Decision Maker AI backend is active.',
    timestamp: new Date().toISOString(),
  });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested API route does not exist.',
  });
});

export default app;
