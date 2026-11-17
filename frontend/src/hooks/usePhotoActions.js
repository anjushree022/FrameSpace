import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../services/api';

// Optimistic like / bookmark toggles shared by the grid and the detail page.
// `onUpdate(photo)` receives the updated photo object after each change.
export default function usePhotoActions(onUpdate) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = () => {
    if (user) return true;
    toast.info('Log in to like and save photographs.');
    navigate('/login', { state: { from: location.pathname + location.search } });
    return false;
  };

  const toggleLike = async (photo) => {
    if (!requireAuth()) return;
    const next = { ...photo, likedByMe: !photo.likedByMe, likeCount: photo.likeCount + (photo.likedByMe ? -1 : 1) };
    onUpdate(next);
    try {
      const res = await api.toggleLike(photo._id, !photo.likedByMe);
      onUpdate({ ...next, likedByMe: res.liked, likeCount: res.likeCount });
    } catch (e) {
      onUpdate(photo);
      toast.error(e.message);
    }
  };

  const toggleBookmark = async (photo) => {
    if (!requireAuth()) return;
    const next = { ...photo, bookmarkedByMe: !photo.bookmarkedByMe };
    onUpdate(next);
    try {
      const res = await api.toggleBookmark(photo._id, !photo.bookmarkedByMe);
      const final = { ...next, bookmarkedByMe: res.bookmarked };
      onUpdate(final);
      toast.success(res.bookmarked ? 'Saved to your bookmarks.' : 'Removed from your bookmarks.');
    } catch (e) {
      onUpdate(photo);
      toast.error(e.message);
    }
  };

  return { toggleLike, toggleBookmark };
}
