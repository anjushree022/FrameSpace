import User from '../models/User.js';
import Photo from '../models/Photo.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import Challenge from '../models/Challenge.js';
import ChallengeSubmission from '../models/ChallengeSubmission.js';
import asyncHandler from '../utils/asyncHandler.js';
import { CATEGORIES } from '../utils/constants.js';
import { decoratePhotos, selfUser } from '../utils/serialize.js';

export const stats = asyncHandler(async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const [users, photos, likes, bookmarks, challenges, activeChallenges, submissions, photosThisWeek, byCat] = await Promise.all([
    User.countDocuments(),
    Photo.countDocuments(),
    Like.countDocuments(),
    Bookmark.countDocuments(),
    Challenge.countDocuments(),
    Challenge.countDocuments({ status: 'active', deadline: { $gte: new Date() } }),
    ChallengeSubmission.countDocuments(),
    Photo.countDocuments({ createdAt: { $gte: weekAgo } }),
    Photo.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);
  const counts = new Map(byCat.map((c) => [c._id, c.count]));
  res.json({
    users, photos, likes, bookmarks, challenges, activeChallenges, submissions, photosThisWeek,
    byCategory: CATEGORIES.map((name) => ({ name, count: counts.get(name) || 0 })),
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const [users, counts] = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(500),
    Photo.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }]),
  ]);
  const byUser = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json({ users: users.map((u) => ({ ...selfUser(u), photoCount: byUser.get(String(u._id)) || 0 })) });
});

export const listPhotos = asyncHandler(async (req, res) => {
  const items = await Photo.find().sort({ createdAt: -1 }).limit(500).lean();
  res.json({ photos: await decoratePhotos(items, req.user._id) });
});
