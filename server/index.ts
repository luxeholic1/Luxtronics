/**
 * Express Server Setup with MongoDB
 * Main server file that integrates all services
 */

import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { initializeMongoDB, disconnectMongoDB } from './db/mongodb';
import { createProductRoutes } from './routes/products';
import { createUserRoutes } from './routes/users';
import { globalRateLimiter, sanitizeRequestBody, securityHeaders } from './middleware/security';

// Load environment variables
dotenv.config();

interface ServerConfig {
  port?: number;
  corsOrigin?: string | string[];
}

export async function setupServer(config: ServerConfig = {}): Promise<Express> {
  const port = config.port || parseInt(process.env.PORT || '3001');
  const configuredOrigin = config.corsOrigin || process.env.CORS_ORIGIN || 'http://localhost:5173';
  const corsOrigin = Array.isArray(configuredOrigin)
    ? configuredOrigin
    : String(configuredOrigin)
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

  const app = express();
  app.set('trust proxy', 1);

  // Middleware
  app.use(securityHeaders);
  app.use(globalRateLimiter);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));
  app.use(sanitizeRequestBody);
  app.use(
    cors({
      origin: corsOrigin.length > 0 ? corsOrigin : true,
      credentials: true,
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Initialize MongoDB
  try {
    console.log('🔄 Initializing MongoDB...');
    const db = await initializeMongoDB();
    console.log('✅ MongoDB initialized successfully!');

    // Register API routes
    const productRoutes = createProductRoutes(db);
    const userRoutes = createUserRoutes(db);
    app.use('/api', productRoutes);
    app.use('/api', userRoutes);
  } catch (error) {
    console.error('❌ Failed to initialize MongoDB:', error);
    throw error;
  }

  // Serve frontend build in production.
  const primaryBuildPath = path.resolve(process.cwd(), 'dist');
  const fallbackBuildPath = path.resolve(process.cwd(), 'build');
  const clientDistPath = existsSync(primaryBuildPath) ? primaryBuildPath : fallbackBuildPath;

  if (process.env.NODE_ENV === 'production' && existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path === '/health') {
        return next();
      }

      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  });

  // Start server
  const server = app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.close(async () => {
      await disconnectMongoDB();
      console.log('✅ Server shut down');
      process.exit(0);
    });
  });

  return app;
}

// Start server if this file is run directly
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  setupServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default setupServer;
