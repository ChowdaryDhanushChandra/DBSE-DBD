import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import hostelRoutes from './routes/hostelRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import allocationRoutes from './routes/allocationRoutes.js';
import messRoutes from './routes/messRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Auto-seed helper
import User from './models/User.js';
import { seedDatabase } from './utils/seeder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Connect Database
await connectDB();

// Auto-seed if empty database
try {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('[Bootstrap] No existing users found. Auto-seeding initial demo data...');
    await seedDatabase();
  }
} catch (seedErr) {
  console.warn('[Bootstrap] Auto-seed check skipped or encountered note:', seedErr.message);
}

// Middleware
app.use(cors({
  origin: '*', // Allow Vite client during dev
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Hostel Connect API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 HOSTEL CONNECT Server is running on port ${PORT}`);
  console.log(`📡 REST API Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});

export default app;
