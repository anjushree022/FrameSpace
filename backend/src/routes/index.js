import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { validateObjectId } from '../middleware/error.js';
import * as auth from '../controllers/authController.js';
import * as photos from '../controllers/photoController.js';
import * as actions from '../controllers/interactionController.js';
import * as users from '../controllers/userController.js';
import * as challenges from '../controllers/challengeController.js';
import * as admin from '../controllers/adminController.js';

const router = Router();
router.param('id', validateObjectId);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

router.get('/health', (req, res) => res.json({ ok: true }));

// Authentication
router.post('/auth/register', authLimiter, auth.register);
router.post('/auth/login', authLimiter, auth.login);
router.get('/auth/me', requireAuth, auth.me);

// Photographs
router.get('/photos', optionalAuth, photos.listPhotos);
router.post('/photos', requireAuth, uploadImage, photos.createPhoto);
router.get('/photos/:id', optionalAuth, photos.getPhoto);
router.get('/photos/:id/related', optionalAuth, photos.relatedPhotos);
router.delete('/photos/:id', requireAuth, photos.deletePhoto);

// Likes and bookmarks
router.post('/photos/:id/like', requireAuth, actions.likePhoto);
router.delete('/photos/:id/like', requireAuth, actions.unlikePhoto);
router.post('/photos/:id/bookmark', requireAuth, actions.addBookmark);
router.delete('/photos/:id/bookmark', requireAuth, actions.removeBookmark);
router.get('/bookmarks', requireAuth, actions.listBookmarks);

// Users
router.put('/users/me', requireAuth, users.updateMe);
router.get('/users/:username', users.getProfile);
router.get('/users/:username/photos', optionalAuth, users.getUserPhotos);

// Challenges
router.get('/challenges', optionalAuth, challenges.listChallenges);
router.post('/challenges', requireAuth, requireAdmin, challenges.createChallenge);
router.get('/challenges/:id', optionalAuth, challenges.getChallenge);
router.put('/challenges/:id', requireAuth, requireAdmin, challenges.updateChallenge);
router.delete('/challenges/:id', requireAuth, requireAdmin, challenges.deleteChallenge);
router.post('/challenges/:id/submissions', requireAuth, challenges.submitToChallenge);

// Admin
router.get('/admin/stats', requireAuth, requireAdmin, admin.stats);
router.get('/admin/users', requireAuth, requireAdmin, admin.listUsers);
router.get('/admin/photos', requireAuth, requireAdmin, admin.listPhotos);

export default router;
