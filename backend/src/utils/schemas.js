import { z } from 'zod';
import ApiError from './ApiError.js';
import { CATEGORIES, CHALLENGE_STATUSES } from './constants.js';

const msg = (m) => ({ required_error: m, invalid_type_error: m });

export function parse(schema, data) {
  const result = schema.safeParse(data ?? {});
  if (result.success) return result.data;
  const fields = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] ?? 'form';
    if (!fields[key]) fields[key] = issue.message;
  }
  throw new ApiError(422, 'Please fix the highlighted fields.', fields);
}

const name = z.string(msg('Enter your name (at least 2 characters).')).trim().min(2, 'Enter your name (at least 2 characters).').max(50, 'Keep your name under 50 characters.');
const username = z
  .string(msg('Use 3-20 letters, numbers, dots or underscores.'))
  .trim()
  .regex(/^[a-zA-Z0-9._]{3,20}$/, 'Use 3-20 letters, numbers, dots or underscores.')
  .transform((s) => s.toLowerCase());
const email = z.string(msg('Enter a valid email address.')).trim().toLowerCase().email('Enter a valid email address.');
const password = z
  .string(msg('Use at least 8 characters with a letter and a number.'))
  .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,72}$/, 'Use at least 8 characters with a letter and a number.');

export const registerSchema = z.object({ name, username, email, password });

export const loginSchema = z.object({
  identifier: z.string(msg('Enter your email or username.')).trim().min(1, 'Enter your email or username.'),
  password: z.string(msg('Enter your password.')).min(1, 'Enter your password.'),
});

const parseTags = (value) => {
  let list = value;
  if (typeof value === 'string') {
    try {
      list = JSON.parse(value);
    } catch {
      list = value.split(',');
    }
  }
  if (!Array.isArray(list)) return [];
  return [...new Set(list.map((t) => String(t).trim().toLowerCase().replace(/^#/, '')).filter(Boolean))];
};

export const photoSchema = z.object({
  caption: z.string(msg('Add a caption.')).trim().min(1, 'Add a caption.').max(100, 'Keep the caption under 100 characters.'),
  description: z.string().trim().max(500, 'Keep the description under 500 characters.').optional().default(''),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Pick a category.' }) }),
  tags: z
    .preprocess(parseTags, z.array(z.string().max(30, 'Tags must be under 30 characters.')).max(8, 'You can add up to 8 tags.'))
    .optional()
    .default([]),
});

export const profileSchema = z.object({
  name,
  username,
  bio: z.string().trim().max(160, 'Keep your bio under 160 characters.').optional().default(''),
  profileImage: z.string().optional(),
});

export const challengeSchema = z
  .object({
    title: z.string(msg('Add a title.')).trim().min(1, 'Add a title.').max(80, 'Keep the title under 80 characters.'),
    theme: z.string(msg('Add a theme.')).trim().min(1, 'Add a theme.').max(40, 'Keep the theme under 40 characters.'),
    description: z.string(msg('Add a short description.')).trim().min(1, 'Add a short description.').max(600, 'Keep the description under 600 characters.'),
    startDate: z.coerce.date({ errorMap: () => ({ message: 'Choose a start date.' }) }),
    deadline: z.coerce.date({ errorMap: () => ({ message: 'Choose a deadline.' }) }),
    status: z.enum(CHALLENGE_STATUSES, { errorMap: () => ({ message: 'Choose a status.' }) }),
  })
  .refine((c) => c.deadline >= c.startDate, { path: ['deadline'], message: 'The deadline must be after the start date.' });
