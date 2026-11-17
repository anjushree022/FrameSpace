import Photo from '../models/Photo.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { decoratePhotos } from '../utils/serialize.js';

const ensurePhoto = async (id) => {
  if (!(await Photo.exists({ _id: id }))) throw new ApiError(404, 'Photograph not found.');
};

const likeCountOf = async (id) => (await Photo.findById(id).select('likeCount').lean())?.likeCount ?? 0;

// The unique index guarantees a user can like a photograph only once, even with
// concurrent requests; the counter only changes when a document is really created/removed.
export const likePhoto = asyncHandler(async (req, res) => {
  const photoId = req.params.id;
  await ensurePhoto(photoId);
  try {
    await Like.create({ userId: req.user._id, photoId });
    await Photo.updateOne({ _id: photoId }, { $inc: { likeCount: 1 } });
  } catch (err) {
    if (err.code !== 11000) throw err;
  }
  res.json({ liked: true, likeCount: await likeCountOf(photoId) });
});

export const unlikePhoto = asyncHandler(async (req, res) => {
  const photoId = req.params.id;
  await ensurePhoto(photoId);
  const { deletedCount } = await Like.deleteOne({ userId: req.user._id, photoId });
  if (deletedCount) await Photo.updateOne({ _id: photoId, likeCount: { $gt: 0 } }, { $inc: { likeCount: -1 } });
  res.json({ liked: false, likeCount: await likeCountOf(photoId) });
});

export const addBookmark = asyncHandler(async (req, res) => {
  await ensurePhoto(req.params.id);
  try {
    await Bookmark.create({ userId: req.user._id, photoId: req.params.id });
  } catch (err) {
    if (err.code !== 11000) throw err;
  }
  res.json({ bookmarked: true });
});

export const removeBookmark = asyncHandler(async (req, res) => {
  await Bookmark.deleteOne({ userId: req.user._id, photoId: req.params.id });
  res.json({ bookmarked: false });
});

export const listBookmarks = asyncHandler(async (req, res) => {
  const marks = await Bookmark.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  const photos = await Photo.find({ _id: { $in: marks.map((b) => b.photoId) } }).lean();
  const byId = new Map(photos.map((p) => [String(p._id), p]));
  const ordered = marks.map((b) => byId.get(String(b.photoId))).filter(Boolean);
  res.json({ photos: await decoratePhotos(ordered, req.user._id) });
});
