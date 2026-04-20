import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, displayName, name, role } = req.body;
      const resolvedDisplayName = displayName ?? name;
      if (!resolvedDisplayName) {
        throw new AppError('displayName (or name) is required', 400);
      }
      const result = await authService.register({ email, password, displayName: resolvedDisplayName, role });
      const { user, tokens } = result;
      res.status(201).json({
        success: true,
        user,
        token: tokens.accessToken,
        data: result,
      });
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({
        success: true,
        user: result.user,
        token: result.tokens.accessToken,
        data: result,
      });
    } catch (err) { next(err); }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refresh(refreshToken);
      res.json({ success: true, data: tokens });
    } catch (err) { next(err); }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.userId);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) { next(err); }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (err) { next(err); }
  },
};
