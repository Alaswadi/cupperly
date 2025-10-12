import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
// Only load .env files if DATABASE_URL is not already set (e.g., by Docker)
if (!process.env.DATABASE_URL) {
  console.log('📝 Loading environment from .env files...');
  // Try to load from multiple locations to support different run contexts
  dotenv.config({ path: path.resolve(__dirname, '../.env') }); // apps/api/.env
  dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // root .env
  dotenv.config(); // current directory .env
} else {
  console.log('📝 Using environment variables from Docker/System');
}

// Log database connection for debugging
console.log('🔍 NODE_ENV:', process.env.NODE_ENV || 'NOT SET ❌');
console.log('🔍 NODE_ENV type:', typeof process.env.NODE_ENV);
console.log('🔍 Database URL:', process.env.DATABASE_URL ? 'Loaded ✓' : 'NOT FOUND ✗');
const dbHost = process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown';
console.log('🔍 Database Host:', dbHost);

// Warn if using localhost in what appears to be a Docker environment
if (dbHost.includes('localhost') && process.env.HOSTNAME) {
  console.warn('⚠️  WARNING: Using localhost for database in Docker!');
  console.warn('   This will not work. Use service name "postgres" instead.');
  console.warn('   Make sure docker-compose is using --env-file .env.docker');
}

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
// import { tenantMiddleware } from './middleware/tenant';

// Import routes
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
import samplesRoutes from './routes/samples';
import sessionsRoutes from './routes/sessions';
import templatesRoutes from './routes/templates';
import flavorDescriptorsRoutes from './routes/flavorDescriptors';
import settingsRoutes from './routes/settings';
import aiRoutes from './routes/ai';
import greenBeanGradingRoutes from './routes/greenBeanGrading';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Enable trust proxy for Coolify/reverse proxy
app.set('trust proxy', 1); // Trust first proxy (Coolify)
console.log('🔧 Trust proxy enabled for reverse proxy support');

// Determine if we're in production
// Check multiple indicators since Coolify might not set NODE_ENV correctly
const isProduction = process.env.NODE_ENV === 'production' ||
                     process.env.NODE_ENV === 'prod' ||
                     process.env.WEB_URL?.includes('cupperly.com') ||
                     process.env.API_URL?.includes('cupperly.com') ||
                     process.env.DATABASE_URL?.includes('postgres:5432'); // Docker/Coolify uses service name

console.log('🔍 Production Detection:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   WEB_URL:', process.env.WEB_URL || 'not set');
console.log('   API_URL:', process.env.API_URL || 'not set');
console.log('   DATABASE_URL contains postgres:5432:', process.env.DATABASE_URL?.includes('postgres:5432'));

// CORS configuration - MUST be before other middleware
const allowedOrigins = isProduction
  ? [
      'https://demo.cupperly.com',
      'https://api.cupperly.com',
      'http://demo.cupperly.com',
      'http://api.cupperly.com',
      /\.cupperly\.com$/
    ]
  : [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001'
    ];

console.log('🔒 CORS Configuration:');
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   Is Production:', isProduction);
console.log('   Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }

    console.log('🔍 CORS: Checking origin:', origin);

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      }
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      console.log('✅ CORS: Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS: Origin blocked:', origin);
      // Don't throw error, just deny the request
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Security middleware - AFTER CORS
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 10000, // much higher limit for dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Use X-Forwarded-For header when behind proxy
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
  },
  skip: (req) => {
    // Skip rate limiting for health checks in development
    return !isProduction && req.path === '/api/health';
  },
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Tenant middleware (extract tenant from subdomain or header)
// app.use(tenantMiddleware);

// Routes
console.log('🔧 Registering routes...');
app.use('/api/health', healthRoutes);
console.log('✅ Health routes registered');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered');
app.use('/api/samples', samplesRoutes);
console.log('✅ Samples routes registered');
app.use('/api/sessions', sessionsRoutes);
console.log('✅ Sessions routes registered');
app.use('/api/templates', templatesRoutes);
console.log('✅ Templates routes registered');
app.use('/api/flavor-descriptors', flavorDescriptorsRoutes);
console.log('✅ Flavor descriptors routes registered');
app.use('/api/settings', settingsRoutes);
console.log('✅ Settings routes registered');
app.use('/api/ai', aiRoutes);
console.log('✅ AI routes registered');
app.use('/api/samples', greenBeanGradingRoutes);
console.log('✅ Green bean grading routes registered');

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Cupperly API server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
