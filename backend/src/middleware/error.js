import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

export function notFound(req, res, next) {
  next(new ApiError(404, `No route for ${req.method} ${req.originalUrl}`));
}

export function validateObjectId(req, res, next, value) {
  if (!mongoose.isValidObjectId(value)) return next(new ApiError(404, 'Not found.'));
  next();
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, ...(err.fields && { fields: err.fields }) });
  }
  if (err.code === 11000) {
    const key = Object.keys(err.keyPattern || err.keyValue || {})[0];
    const fields = key ? { [key]: `That ${key} is already in use.` } : undefined;
    return res.status(409).json({ message: fields ? fields[key] : 'That already exists.', fields });
  }
  if (err instanceof mongoose.Error.CastError) return res.status(404).json({ message: 'Not found.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'The request body is not valid JSON.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'The request is too large.' });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our side. Please try again.' });
}
