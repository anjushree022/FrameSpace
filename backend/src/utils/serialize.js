import User from '../models/User.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';

export const publicUser = (u) => ({
  _id: u._id,
  name: u.name,
  username: u.username,
  bio: u.bio,
  profileImage: u.profileImage,
  role: u.role,
  createdAt: u.createdAt,
});

export const selfUser = (u) => ({ ...publicUser(u), email: u.email });

const DELETED = { _id: null, name: 'Deleted user', username: 'deleted', profileImage: '' };

// Adds the photographer plus the current user's like/bookmark state to each photograph.
export async function decoratePhotos(photos, meId) {
  if (!photos.length) return [];
  const ids = photos.map((p) => p._id);
  const userIds = [...new Set(photos.map((p) => String(p.userId)))];

  const [users, likes, bookmarks] = await Promise.all([
    User.find({ _id: { $in: userIds } }).select('name username profileImage').lean(),
    meId ? Like.find({ userId: meId, photoId: { $in: ids } }).select('photoId').lean() : [],
    meId ? Bookmark.find({ userId: meId, photoId: { $in: ids } }).select('photoId').lean() : [],
  ]);

  const byId = new Map(users.map((u) => [String(u._id), u]));
  const liked = new Set(likes.map((l) => String(l.photoId)));
  const saved = new Set(bookmarks.map((b) => String(b.photoId)));

  return photos.map((p) => {
    const u = byId.get(String(p.userId));
    return {
      _id: p._id,
      userId: p.userId,
      imageUrl: p.imageUrl,
      width: p.width,
      height: p.height,
      caption: p.caption,
      description: p.description,
      category: p.category,
      tags: p.tags,
      createdAt: p.createdAt,
      likeCount: p.likeCount,
      likedByMe: liked.has(String(p._id)),
      bookmarkedByMe: saved.has(String(p._id)),
      user: u ? { _id: u._id, name: u.name, username: u.username, profileImage: u.profileImage } : DELETED,
    };
  });
}

export const decoratePhoto = async (photo, meId) => (await decoratePhotos([photo], meId))[0];
