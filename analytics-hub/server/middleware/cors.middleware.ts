/**
 * CORS MIDDLEWARE
 * Allow stellar-den to send analytics events
 */

import cors from 'cors';

// Allowed origins (stellar-den domains + main website)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .concat([
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://alicesolutionsgroup.com',
    'https://www.alicesolutionsgroup.com',
    'https://analytics-hub-dashboard.onrender.com',
  ]);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 hours
});
