import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import { UserService } from '../services/user-service';
import { authRateLimiter } from '../middleware/security';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidDisplayName(value: unknown): boolean {
  const text = String(value || '').trim();
  return text.length >= 1 && text.length <= 50;
}

function normalizePhone(value: unknown): string | undefined {
  const text = String(value || '').trim();
  if (!text) {
    return undefined;
  }

  return text;
}

function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const token = req.headers['x-auth-token'];
  return typeof token === 'string' ? token : null;
}

export function createUserRoutes(db: Db): Router {
  const router = Router();
  const userService = new UserService(db);

  router.post('/users/register', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, password, phone } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'firstName, lastName, email and password are required',
        });
      }

      if (String(password).length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters long',
        });
      }

      if (!EMAIL_REGEX.test(String(email))) {
        return res.status(400).json({ success: false, error: 'Invalid email format' });
      }

      if (!isValidDisplayName(firstName) || !isValidDisplayName(lastName)) {
        return res.status(400).json({
          success: false,
          error: 'firstName and lastName must be non-empty strings',
        });
      }

      const result = await userService.registerUser({
        firstName: String(firstName),
        lastName: String(lastName),
        email: String(email),
        password: String(password),
        phone: normalizePhone(phone),
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user';
      const status = message.includes('already exists') ? 409 : 500;
      res.status(status).json({ success: false, error: message });
    }
  });

  router.post('/users/login', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'email and password are required',
        });
      }

      if (!EMAIL_REGEX.test(String(email))) {
        return res.status(400).json({ success: false, error: 'Invalid email format' });
      }

      const result = await userService.loginUser(String(email), String(password));
      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      const status = message.includes('Invalid email or password') ? 401 : 500;
      res.status(status).json({ success: false, error: message });
    }
  });

  router.get('/users/me', async (req: Request, res: Response) => {
    try {
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const user = await userService.getUserByToken(token);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load user';
      res.status(500).json({ success: false, error: message });
    }
  });

  router.put('/users/me', async (req: Request, res: Response) => {
    try {
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { firstName, lastName, phone } = req.body;

      if (firstName !== undefined && !isValidDisplayName(firstName)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid first name',
        });
      }

      if (lastName !== undefined && !isValidDisplayName(lastName)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid last name',
        });
      }

      const user = await userService.updateUserByToken(token, {
        firstName: firstName !== undefined ? String(firstName) : undefined,
        lastName: lastName !== undefined ? String(lastName) : undefined,
        phone: normalizePhone(phone),
      });

      res.json({ success: true, data: user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      const status = message === 'Unauthorized' ? 401 : 500;
      res.status(status).json({ success: false, error: message });
    }
  });

  router.post('/users/logout', async (req: Request, res: Response) => {
    try {
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      await userService.logout(token);
      res.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      res.status(500).json({ success: false, error: message });
    }
  });

  return router;
}
