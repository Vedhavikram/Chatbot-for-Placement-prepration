import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDb } from './db/init';
import { errorMiddleware } from './middleware/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/advisor.routes';
import aptitudeRoutes from './routes/aptitude.routes';
import codingRoutes from './routes/coding.routes';
import interviewRoutes from './routes/interview.routes';
import resumeRoutes from './routes/resume.routes';
import companyRoutes from './routes/company.routes';
import trackerRoutes from './routes/tracker.routes';

const app = express();
const httpServer = createServer(app);

// Socket.IO for real-time features
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: process.env.DATABASE_URL ? 'postgres' : 'sqlite' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/advisor', companyRoutes);
app.use('/api/tracker', trackerRoutes);

// Socket.IO events for live interview sessions
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join-session', (sessionId: string) => {
    socket.join(sessionId);
    socket.emit('session-ready', { sessionId });
  });

  socket.on('send-message', (data: { sessionId: string; message: string }) => {
    io.to(data.sessionId).emit('receive-message', {
      from: socket.id,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Error handler (must be last)
app.use(errorMiddleware);

// Start server
const PORT = parseInt(process.env.PORT || '5000', 10);

const start = async () => {
  try {
    await initDb();
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 PlaceMentor AI Backend running on http://localhost:${PORT}`);
      console.log(`📊 Mode: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite (local)'}`);
      console.log(`🤖 AI: ${process.env.ANTHROPIC_API_KEY ? 'Claude API' : 'Mock mode (set ANTHROPIC_API_KEY for live AI)'}`);
      console.log(`✅ Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
