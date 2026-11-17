import multer from 'multer';
import ApiError from '../utils/ApiError.js';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '../utils/constants.js';

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (req, file, cb) =>
    ALLOWED_IMAGE_TYPES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new ApiError(422, 'Upload a JPEG, PNG or WebP image.', { image: 'Upload a JPEG, PNG or WebP image.' })),
});

export const uploadImage = (req, res, next) =>
  uploader.single('image')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(422, 'That image is too large.', { image: 'Images must be under 10 MB.' }));
    }
    next(err);
  });
