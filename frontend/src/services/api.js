// Every call the UI makes to the FrameSpace REST API lives here.
import http, { tokenStore } from './http';

/* ---------- auth ---------- */

export async function register(details) {
  const { data } = await http.post('/auth/register', details);
  tokenStore.set(data.token);
  return data.user;
}

export async function login({ identifier, password }) {
  const { data } = await http.post('/auth/login', { identifier, password });
  tokenStore.set(data.token);
  return data.user;
}

export async function logout() {
  tokenStore.clear();
}

export async function getMe() {
  if (!tokenStore.get()) return null;
  try {
    const { data } = await http.get('/auth/me');
    return data.user;
  } catch (e) {
    if (e.status === 401) return null;
    throw e;
  }
}

/* ---------- photographs ---------- */

export async function listPhotos({ q = '', category = '', sort = 'newest', page = 1, limit = 20 } = {}) {
  const { data } = await http.get('/photos', { params: { q, category, sort, page, limit } });
  return data;
}

export async function getPhoto(id) {
  const { data } = await http.get(`/photos/${id}`);
  return data.photo;
}

export async function getRelatedPhotos(id) {
  const { data } = await http.get(`/photos/${id}/related`);
  return data.photos;
}

export async function createPhoto({ file, caption, description = '', category, tags = [] }) {
  const form = new FormData();
  form.append('image', file);
  form.append('caption', caption);
  form.append('description', description);
  form.append('category', category);
  form.append('tags', JSON.stringify(tags));
  const { data } = await http.post('/photos', form, { timeout: 90000 });
  return data.photo;
}

export async function deletePhoto(id) {
  await http.delete(`/photos/${id}`);
}

/* ---------- likes and bookmarks ---------- */

export async function toggleLike(photoId, like) {
  const { data } = like ? await http.post(`/photos/${photoId}/like`) : await http.delete(`/photos/${photoId}/like`);
  return data; // { liked, likeCount }
}

export async function toggleBookmark(photoId, bookmark) {
  const { data } = bookmark ? await http.post(`/photos/${photoId}/bookmark`) : await http.delete(`/photos/${photoId}/bookmark`);
  return data; // { bookmarked }
}

export async function listBookmarks() {
  const { data } = await http.get('/bookmarks');
  return data.photos;
}

/* ---------- profiles ---------- */

export async function getProfile(username) {
  const name = encodeURIComponent(username);
  const [profile, photos] = await Promise.all([http.get(`/users/${name}`), http.get(`/users/${name}/photos`)]);
  return { user: profile.data.user, stats: profile.data.stats, photos: photos.data.photos };
}

export async function getUserPhotos(username) {
  const { data } = await http.get(`/users/${encodeURIComponent(username)}/photos`);
  return data.photos;
}

export async function updateProfile({ name, username, bio, profileImage }) {
  const { data } = await http.put('/users/me', { name, username, bio, profileImage });
  return data.user;
}

/* ---------- challenges ---------- */

// The forms use <input type="date"> values (YYYY-MM-DD); the API takes full timestamps.
const challengeBody = (c) => ({
  title: c.title,
  theme: c.theme,
  description: c.description,
  status: c.status,
  startDate: c.startDate ? new Date(`${c.startDate}T00:00:00`).toISOString() : '',
  deadline: c.deadline ? new Date(`${c.deadline}T23:59:59`).toISOString() : '',
});

export async function listChallenges() {
  const { data } = await http.get('/challenges');
  return data.challenges;
}

export async function getChallenge(id) {
  const { data } = await http.get(`/challenges/${id}`);
  return data; // { challenge, submissions }
}

export async function submitToChallenge(challengeId, photoId) {
  await http.post(`/challenges/${challengeId}/submissions`, { photoId });
}

export async function createChallenge(input) {
  const { data } = await http.post('/challenges', challengeBody(input));
  return data.challenge;
}

export async function updateChallenge(id, input) {
  const { data } = await http.put(`/challenges/${id}`, challengeBody(input));
  return data.challenge;
}

export async function deleteChallenge(id) {
  await http.delete(`/challenges/${id}`);
}

/* ---------- admin ---------- */

export async function adminGetStats() {
  const { data } = await http.get('/admin/stats');
  return data;
}

export async function adminListUsers() {
  const { data } = await http.get('/admin/users');
  return data.users;
}

export async function adminListPhotos() {
  const { data } = await http.get('/admin/photos');
  return data.photos;
}
