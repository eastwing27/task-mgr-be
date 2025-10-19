import express from 'express';
import cors from 'cors';
import routesV1 from './routes/v1';

const app = express();

// CORS настройки
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/v1', routesV1);

export default app;
