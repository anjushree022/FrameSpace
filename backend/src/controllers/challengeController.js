import Challenge from '../models/Challenge.js';
import ChallengeSubmission from '../models/ChallengeSubmission.js';
import Photo from '../models/Photo.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { challengeSchema, parse } from '../utils/schemas.js';
import { decoratePhotos } from '../utils/serialize.js';
import mongoose from 'mongoose';

// An "active" challenge past its deadline reads as closed.
const effectiveStatus = (c) => (c.status === 'active' && new Date(c.deadline) < new Date() ? 'closed' : c.status);

async function challengeViews(challenges, meId) {
  const ids = challenges.map((c) => c._id);
  const [counts, mine] = await Promise.all([
    ChallengeSubmission.aggregate([
      { $match: { challengeId: { $in: ids } } },
      { $sort: { submittedAt: -1 } },
      { $group: { _id: '$challengeId', count: { $sum: 1 }, latestPhotoId: { $first: '$photoId' } } },
    ]),
    meId ? ChallengeSubmission.find({ challengeId: { $in: ids }, userId: meId }).lean() : [],
  ]);
  const covers = await Photo.find({ _id: { $in: counts.map((c) => c.latestPhotoId) } }).select('imageUrl').lean();
  const coverById = new Map(covers.map((p) => [String(p._id), p.imageUrl]));
  const countById = new Map(counts.map((c) => [String(c._id), c]));
  const mineById = new Map(mine.map((s) => [String(s.challengeId), String(s.photoId)]));

  return challenges.map((c) => {
    const agg = countById.get(String(c._id));
    return {
      _id: c._id,
      title: c.title,
      theme: c.theme,
      description: c.description,
      startDate: c.startDate,
      deadline: c.deadline,
      status: effectiveStatus(c),
      submissionCount: agg?.count ?? 0,
      coverUrl: agg ? coverById.get(String(agg.latestPhotoId)) || '' : '',
      mySubmission: mineById.get(String(c._id)) || null,
    };
  });
}

export const listChallenges = asyncHandler(async (req, res) => {
  const items = await Challenge.find().sort({ deadline: -1 }).lean();
  res.json({ challenges: await challengeViews(items, req.user?._id) });
});

export const getChallenge = asyncHandler(async (req, res) => {
  const c = await Challenge.findById(req.params.id).lean();
  if (!c) throw new ApiError(404, 'This challenge does not exist.');
  const subs = await ChallengeSubmission.find({ challengeId: c._id }).sort({ submittedAt: -1 }).lean();
  const photos = await Photo.find({ _id: { $in: subs.map((s) => s.photoId) } }).lean();
  const byId = new Map(photos.map((p) => [String(p._id), p]));
  const ordered = subs.map((s) => byId.get(String(s.photoId))).filter(Boolean);
  const decorated = await decoratePhotos(ordered, req.user?._id);
  const at = new Map(subs.map((s) => [String(s.photoId), s.submittedAt]));

  res.json({
    challenge: (await challengeViews([c], req.user?._id))[0],
    submissions: decorated.map((p) => ({ ...p, submittedAt: at.get(String(p._id)) })),
  });
});

export const createChallenge = asyncHandler(async (req, res) => {
  const c = await Challenge.create(parse(challengeSchema, req.body));
  res.status(201).json({ challenge: (await challengeViews([c.toObject()], null))[0] });
});

export const updateChallenge = asyncHandler(async (req, res) => {
  const data = parse(challengeSchema, req.body);
  const c = await Challenge.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).lean();
  if (!c) throw new ApiError(404, 'Challenge not found.');
  res.json({ challenge: (await challengeViews([c], null))[0] });
});

export const deleteChallenge = asyncHandler(async (req, res) => {
  const c = await Challenge.findByIdAndDelete(req.params.id);
  if (!c) throw new ApiError(404, 'Challenge not found.');
  await ChallengeSubmission.deleteMany({ challengeId: c._id });
  res.status(204).end();
});

export const submitToChallenge = asyncHandler(async (req, res) => {
  const { photoId } = req.body || {};
  if (!mongoose.isValidObjectId(photoId)) {
    throw new ApiError(422, 'Choose one of your own photographs.', { photoId: 'Choose a photograph.' });
  }
  const c = await Challenge.findById(req.params.id).lean();
  if (!c) throw new ApiError(404, 'This challenge does not exist.');
  if (effectiveStatus(c) !== 'active') throw new ApiError(409, 'This challenge is not accepting submissions.');

  const photo = await Photo.findById(photoId).select('userId').lean();
  if (!photo || String(photo.userId) !== String(req.user._id)) throw new ApiError(403, 'Choose one of your own photographs.');

  try {
    await ChallengeSubmission.create({ challengeId: c._id, userId: req.user._id, photoId });
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, 'You have already submitted a photograph to this challenge.');
    throw err;
  }
  res.status(201).json({ ok: true });
});
