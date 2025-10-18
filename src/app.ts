import express from 'express';
import routesV1 from './routes/v1';

const app = express();
app.use(express.json());
app.use('/api/v1', routesV1);

export default app;
