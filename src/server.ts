import http from 'http';
import app from './app';
import connectDB from './db/mongoose';
import { initSocketIO } from './socket';
import { PORT } from './config';

const server = http.createServer(app);

// Initialize Socket.IO
initSocketIO(server);

// Connect to MongoDB
connectDB();

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});
