import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const bearer = (req) => {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
};

// Attaches req.user when a valid token is present; never rejects.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = bearer(req);
  if (token) {
    try {
      const { sub } = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(sub);
      if (user) req.user = user;
    } catch {
      /* treat as logged out */
    }
  }
  next();
});

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = bearer(req);
  if (!token) throw new ApiError(401, 'Please log in to continue.');
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please log in again.');
  }
  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'Your session has expired. Please log in again.');
  req.user = user;
  next();
});

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') throw new ApiError(403, 'Admins only.');
  next();
}
