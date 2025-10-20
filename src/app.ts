import express from 'express';
import cors from 'cors';
import routesV1 from './routes/v1';

const app = express();

// CORS настройки
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 
}));

app.use(express.json());
app.use('/api/v1', routesV1);

export default app;
