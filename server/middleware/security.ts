import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

function sanitizeString(value: string): string {
  // Basic payload hardening against stored XSS vectors in user-provided fields.
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .replace(/\u0000/g, '')
    .trim();
}

function sanitizeInput(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeInput(item));
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      // Block operator and dotted keys to reduce NoSQL injection attack surface.
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      result[key] = sanitizeInput(val);
    }

    return result;
  }

  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  return value;
}

export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
  },
});

function overwriteObjectValues(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const key of Object.keys(target)) {
    delete target[key];
  }

  Object.assign(target, source);
}

export function sanitizeRequestBody(req: Request, res: Response, next: NextFunction): void {
  if (req.body) {
    req.body = sanitizeInput(req.body) as Record<string, unknown>;
  }

  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery = sanitizeInput(req.query) as Record<string, unknown>;
    overwriteObjectValues(req.query as unknown as Record<string, unknown>, sanitizedQuery);
  }

  if (req.params && typeof req.params === 'object') {
    const sanitizedParams = sanitizeInput(req.params) as Record<string, unknown>;
    overwriteObjectValues(req.params as unknown as Record<string, unknown>, sanitizedParams);
  }

  next();
}
