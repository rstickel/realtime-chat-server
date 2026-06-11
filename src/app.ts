import express from 'express';
import cors from 'cors';
import roomRoutes from './routes/roomRoutes';
import { CORS_ORIGIN } from './config';

const app = express();

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json()); // For parsing application/json

// Routes
app.get('/', (req, res) => {
  res.send('Chat Server is Running! Access /api/rooms for room list or connect via Socket.IO.');
});
app.use('/api/rooms', roomRoutes);

// Basic error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;
