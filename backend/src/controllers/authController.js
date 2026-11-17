import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { loginSchema, parse, registerSchema } from '../utils/schemas.js';
import { selfUser } from '../utils/serialize.js';

const signToken = (user) => jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

// Compared against when the account does not exist, so response time does not reveal valid emails.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

export const register = asyncHandler(async (req, res) => {
  const data = parse(registerSchema, req.body);

  const [byUsername, byEmail] = await Promise.all([
    User.exists({ username: data.username }),
    User.exists({ email: data.email }),
  ]);
  const fields = {};
  if (byUsername) fields.username = 'That username is taken.';
  if (byEmail) fields.email = 'An account with this email already exists.';
  if (Object.keys(fields).length) throw new ApiError(422, 'Please fix the highlighted fields.', fields);

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await User.create({
    name: data.name,
    username: data.username,
    email: data.email,
    passwordHash,
    role: 'user', // admins are never created through public registration
  });
  res.status(201).json({ token: signToken(user), user: selfUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = parse(loginSchema, req.body);
  const id = identifier.toLowerCase();
  const user = await User.findOne({ $or: [{ email: id }, { username: id }] }).select('+passwordHash');
  const ok = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);
  if (!user || !ok) throw new ApiError(401, 'Incorrect email/username or password.');
  res.json({ token: signToken(user), user: selfUser(user) });
});

export const me = (req, res) => res.json({ user: selfUser(req.user) });
