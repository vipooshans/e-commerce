import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set. Login and protected routes will fail until it is added in the host environment.');
}

connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizeOrigin = (url) => {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url.replace(/\/$/, '');
  }
};

const withWwwVariants = (origin) => {
  try {
    const parsed = new URL(origin);
    const hosts = parsed.hostname.startsWith('www.')
      ? [parsed.hostname, parsed.hostname.slice(4)]
      : [parsed.hostname, `www.${parsed.hostname}`];
    return [...new Set(hosts.map((host) => `${parsed.protocol}//${host}${parsed.port ? `:${parsed.port}` : ''}`))];
  } catch {
    return [origin];
  }
};

// Middleware — allow local, custom domain, FRONTEND_URL(s), and Vercel hosts
const allowedOrigins = [
  ...new Set(
    [
      'http://localhost:5173',
      'https://e-commerce-blush-mu-85.vercel.app',
      'https://www.everbuyglobal.online',
      'https://everbuyglobal.online',
      ...(process.env.FRONTEND_URL || '').split(','),
    ]
      .map((url) => url.trim())
      .filter(Boolean)
      .map(normalizeOrigin)
      .flatMap(withWwwVariants)
  ),
];

app.use(cors({
  origin: (origin, callback) => {
    // Non-browser clients (Postman, server-to-server) send no Origin
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);

    const isLocalDevelopmentOrigin =
      process.env.NODE_ENV !== 'production' &&
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(normalizedOrigin);

    const isVercelOrigin = /^https:\/\/[\w.-]+\.vercel\.app$/i.test(normalizedOrigin);
    const isEverBuyOrigin = /^https:\/\/(www\.)?everbuyglobal\.online$/i.test(normalizedOrigin);

    const isAllowed =
      allowedOrigins.includes(normalizedOrigin) ||
      isLocalDevelopmentOrigin ||
      isVercelOrigin ||
      isEverBuyOrigin;

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'EverBuyGlobal API running' }));

// Error middleware
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});
