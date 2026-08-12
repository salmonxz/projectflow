const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const positionRoutes = require('./routes/position.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const commentRoutes = require('./routes/comment.routes');
const attachmentRoutes = require('./routes/attachment.routes');
const activityRoutes = require('./routes/activity.routes');
const notificationRoutes = require('./routes/notification.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

// CORS Configuration supporting FRONTEND_URL environment variable
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads for local development
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check API (Requirement 8)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const pool = require('./config/database');
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    console.error('Health check DB error:', err.message);
  }

  return res.status(200).json({
    success: true,
    message: 'ProjectFlow API is running',
    database: dbStatus
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api', commentRoutes);
app.use('/api', attachmentRoutes);
app.use('/api', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  return res.status(404).json({
    success: false,
    message: `API Route '${req.originalUrl}' tidak ditemukan.`
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada internal server.'
  });
});

module.exports = app;
