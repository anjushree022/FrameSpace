import Photo from '../models/Photo.js';
import User from '../models/User.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import ChallengeSubmission from '../models/ChallengeSubmission.js';
import { cloudinaryEnabled, destroyImage, uploadBuffer } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import escapeRegex from '../utils/escapeRegex.js';
import { CATEGORIES } from '../utils/constants.js';
import { parse, photoSchema } from '../utils/schemas.js';
import { decoratePhoto, decoratePhotos } from '../utils/serialize.js';

const str = (v) => (typeof v === 'string' ? v : '');

export const listPhotos = asyncHandler(async (req, res) => {
  const q = str(req.query.q).slice(0, 100);
  const category = CATEGORIES.includes(str(req.query.category)) ? str(req.query.category) : '';
  const sort = req.query.sort === 'popular' ? 'popular' : 'newest';
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const filter = {};
  if (category) filter.category = category;

  // Every search word must match the caption, description, tags, category or photographer.
  const words = q.split(/\s+/).filter(Boolean).slice(0, 6);
  if (words.length) {
    filter.$and = [];
    for (const word of words) {
      const rx = new RegExp(escapeRegex(word), 'i');
      const people = await User.find({ $or: [{ username: rx }, { name: rx }] }).select('_id').limit(50).lean();
      filter.$and.push({
        $or: [{ caption: rx }, { description: rx }, { tags: rx }, { category: rx }, { userId: { $in: people.map((u) => u._id) } }],
      });
    }
  }

  const order = sort === 'popular' ? { likeCount: -1, createdAt: -1 } : { createdAt: -1 };
  const [total, items] = await Promise.all([
    Photo.countDocuments(filter),
    Photo.find(filter).sort(order).skip((page - 1) * limit).limit(limit).lean(),
  ]);

  res.json({ photos: await decoratePhotos(items, req.user?._id), total, page, hasMore: page * limit < total });
});

export const getPhoto = asyncHandler(async (req, res) => {
  const photo = await Photo.findById(req.params.id).lean();
  if (!photo) throw new ApiError(404, 'This photograph does not exist or was removed.');
  res.json({ photo: await decoratePhoto(photo, req.user?._id) });
});

export const relatedPhotos = asyncHandler(async (req, res) => {
  const base = await Photo.findById(req.params.id).select('category').lean();
  if (!base) return res.json({ photos: [] });
  const items = await Photo.find({ _id: { $ne: base._id }, category: base.category })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
  res.json({ photos: await decoratePhotos(items, req.user?._id) });
});

export const createPhoto = asyncHandler(async (req, res) => {
  if (!cloudinaryEnabled) throw new ApiError(503, 'Image storage is not configured on the server yet.');
  const data = parse(photoSchema, req.body);
  if (!req.file) throw new ApiError(422, 'Please fix the highlighted fields.', { image: 'Choose a photograph to upload.' });

  const uploaded = await uploadBuffer(req.file.buffer, {
    folder: 'framespace/photos',
    // Cap very large originals; Cloudinary picks the best quality/format on delivery.
    transformation: [{ width: 2400, height: 2400, crop: 'limit' }],
  });

  try {
    const photo = await Photo.create({
      userId: req.user._id,
      imageUrl: uploaded.secure_url,
      imagePublicId: uploaded.public_id,
      width: uploaded.width,
      height: uploaded.height,
      ...data,
    });
    res.status(201).json({ photo: await decoratePhoto(photo.toObject(), req.user._id) });
  } catch (err) {
    await destroyImage(uploaded.public_id); // do not leave orphaned files behind
    throw err;
  }
});

export const deletePhoto = asyncHandler(async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  if (!photo) throw new ApiError(404, 'Photograph not found.');
  const isOwner = String(photo.userId) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'You can only delete your own photographs.');

  await Promise.all([
    Like.deleteMany({ photoId: photo._id }),
    Bookmark.deleteMany({ photoId: photo._id }),
    ChallengeSubmission.deleteMany({ photoId: photo._id }),
    photo.deleteOne(),
  ]);
  await destroyImage(photo.imagePublicId);
  res.status(204).end();
});
