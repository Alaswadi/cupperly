import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

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

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.WEB_URL!, /\.cupperly\.com$/]
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3003', 'http://127.0.0.1:3003'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // much higher limit for dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks in development
    return process.env.NODE_ENV !== 'production' && req.path === '/api/health';
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
