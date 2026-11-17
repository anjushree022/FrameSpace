// Fills the database with sample users, photographs, likes, bookmarks and
// challenges. WARNING: this wipes those collections first. Development only.
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import User from '../models/User.js';
import Photo from '../models/Photo.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import Challenge from '../models/Challenge.js';
import ChallengeSubmission from '../models/ChallengeSubmission.js';
import { CHALLENGES, DAY, DEMO_PASSWORD, PHOTOS, SUBMISSIONS, USERS, unsplash } from './data.js';

if (env.nodeEnv === 'production') {
  console.error('Refusing to seed a production database.');
  process.exit(1);
}

const oid = () => new mongoose.Types.ObjectId();
const now = Date.now();

await mongoose.connect(env.mongoUri);
const models = [User, Photo, Like, Bookmark, Challenge, ChallengeSubmission];
await Promise.all(models.map((M) => M.deleteMany({})));
await Promise.all(models.map((M) => M.syncIndexes()));

const demoHash = await bcrypt.hash(DEMO_PASSWORD, 12);
const adminHash = await bcrypt.hash(env.adminPassword, 12);

// Users ----------------------------------------------------------------------
const userIds = {};
const users = USERS.map(([key, name, username, email, role, bio, profileImage], i) => {
  const _id = oid();
  userIds[key] = _id;
  return {
    _id, name, username, bio, profileImage, profileImageId: '', role,
    email: role === 'admin' ? env.adminEmail.toLowerCase() : email,
    passwordHash: role === 'admin' ? adminHash : demoHash,
    createdAt: new Date(now - (40 - i * 3) * DAY),
  };
});

// Photographs ----------------------------------------------------------------
const photos = PHOTOS.map(([uid, userKey, category, caption, description, tags, ratio, daysAgo], i) => ({
  _id: oid(),
  userId: userIds[userKey],
  imageUrl: unsplash(uid, 900, ratio),
  imagePublicId: '',
  width: 900,
  height: Math.round(900 / ratio),
  caption, description, category,
  tags: tags.split(','),
  likeCount: 0,
  createdAt: new Date(now - daysAgo * DAY - i * 3600000),
}));

// Likes and bookmarks (deterministic spread) ---------------------------------
const likes = [];
const bookmarks = [];
photos.forEach((p, i) => {
  users.forEach((u, j) => {
    if (String(u._id) !== String(p.userId) && (i * 7 + j * 3) % 5 < 2) {
      likes.push({ _id: oid(), userId: u._id, photoId: p._id, createdAt: p.createdAt });
      p.likeCount += 1;
    }
    if (String(u._id) !== String(p.userId) && (i + j * 2) % 9 === 0) {
      bookmarks.push({ _id: oid(), userId: u._id, photoId: p._id, createdAt: p.createdAt });
    }
  });
});

// Challenges -----------------------------------------------------------------
const at = (offsetDays, endOfDay = false) => {
  const d = new Date(now + offsetDays * DAY);
  if (endOfDay) d.setHours(23, 59, 59, 0);
  else d.setHours(0, 0, 0, 0);
  return d;
};
const challenges = CHALLENGES.map(([title, theme, status, start, deadline, description]) => ({
  _id: oid(), title, theme, status, description,
  startDate: at(start), deadline: at(deadline, true), createdAt: new Date(now - 14 * DAY),
}));
const submissions = SUBMISSIONS.map(([ci, pi]) => ({
  _id: oid(),
  challengeId: challenges[ci]._id,
  photoId: photos[pi - 1]._id,
  userId: photos[pi - 1].userId,
  submittedAt: photos[pi - 1].createdAt,
}));

// Raw inserts keep the historical createdAt dates above.
await User.collection.insertMany(users);
await Photo.collection.insertMany(photos);
await Like.collection.insertMany(likes);
await Bookmark.collection.insertMany(bookmarks);
await Challenge.collection.insertMany(challenges);
await ChallengeSubmission.collection.insertMany(submissions);

console.log(`Seeded ${users.length} users, ${photos.length} photographs, ${likes.length} likes, ${bookmarks.length} bookmarks, ${challenges.length} challenges.`);
console.log(`Admin login:  ${env.adminEmail} / ${env.adminPassword}`);
console.log(`Demo login:   aarav@example.com / ${DEMO_PASSWORD}`);
await mongoose.disconnect();
