import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { AuthTokens, JwtPayload, UserRole } from '../types';
import { UserModel, normalize } from '../models';

function generateTokens(user: { id: string; email: string; role: UserRole }): AuthTokens {
  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(data: { email: string; password: string; displayName: string; role?: UserRole }) {
    if (!data?.email || !data.email.trim()) {
      throw new AppError('Email is required', 400);
    }
    if (!data?.password) {
      throw new AppError('Password is required', 400);
    }
    if (!data?.displayName) {
      throw new AppError('Display name is required', 400);
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedRole = (data.role || 'writer').toLowerCase() as UserRole;

    const existing = await UserModel.findOne({ email: normalizedEmail }).select('_id').lean();
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const userDoc = await UserModel.create({
      email: normalizedEmail,
      password_hash: passwordHash,
      display_name: data.displayName.trim(),
      role: normalizedRole,
    });

    const user = normalize(userDoc);
    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

    await UserModel.findByIdAndUpdate(user.id, { refresh_token: tokens.refreshToken });

    return {
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        trust_score: user.trust_score,
        streak_days: user.streak_days,
        genres: user.genres,
        is_verified: user.is_verified,
        created_at: user.createdAt,
      },
      tokens,
    };
  },

  async login(email: string, password: string) {
    if (!email || !email.trim()) {
      throw new AppError('Email is required', 400);
    }
    if (!password) {
      throw new AppError('Password is required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userDoc = await UserModel.findOne({ email: normalizedEmail });
    if (!userDoc) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!userDoc.password_hash) {
      throw new AppError('This account uses OAuth login', 401);
    }

    const isValid = await bcrypt.compare(password, userDoc.password_hash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = normalize(userDoc);
    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });
    await UserModel.findByIdAndUpdate(user.id, { refresh_token: tokens.refreshToken });

    const { password_hash, refresh_token, ...safeUser } = user as any;
    return { user: safeUser, tokens };
  },

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
      const user = await UserModel.findById(decoded.userId).select('id email role refresh_token').lean();
      if (!user || user.refresh_token !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      const tokens = generateTokens({ id: user._id.toString(), email: user.email, role: user.role as UserRole });
      await UserModel.findByIdAndUpdate(user._id, { refresh_token: tokens.refreshToken });
      return tokens;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Invalid refresh token', 401);
    }
  },

  async logout(userId: string) {
    await UserModel.findByIdAndUpdate(userId, { refresh_token: null });
  },

  async getMe(userId: string) {
    const user = await UserModel.findById(userId)
      .select('id email display_name avatar_url bio role genres trust_score streak_days streak_last is_verified createdAt updatedAt')
      .lean();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user._id.toString(),
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      role: user.role,
      genres: user.genres || [],
      trust_score: user.trust_score,
      streak_days: user.streak_days,
      streak_last: user.streak_last,
      is_verified: user.is_verified,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  },
};
