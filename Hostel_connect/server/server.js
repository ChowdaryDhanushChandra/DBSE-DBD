import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import pool, { testConnection } from './config/database.js';
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
import messFeedbackRoutes from './routes/messFeedbackRoutes.js';
import hygieneRoutes from './routes/hygieneRoutes.js';
import parcelRoutes from './routes/parcelRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Test MySQL Database Connection
await testConnection();

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive during local development
    }
  },
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
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const [result] = await pool.query('SELECT 1 as isAlive');
    if (result && result[0]?.isAlive === 1) {
      dbStatus = 'connected';
    }
  } catch (e) {
    dbStatus = 'error: ' + e.message;
  }

  res.status(200).json({
    status: 'online',
    system: 'Hostel Connect API (MySQL)',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
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
app.use('/api/mess-feedback', messFeedbackRoutes);
app.use('/api/hygiene', hygieneRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/visitors', visitorRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Hostel Connect] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[Hostel Connect] API Base URL: http://localhost:${PORT}/api`);
  console.log(`[Hostel Connect] Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
