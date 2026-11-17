import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Bookmark, Heart, Link2, Tag, Trash2 } from 'lucide-react';
import Avatar from '../components/Avatar';
import SmartImage from '../components/SmartImage';
import MasonryGrid from '../components/MasonryGrid';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import usePhotoActions from '../hooks/usePhotoActions';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/format';
import * as api from '../services/api';

export default function PhotoDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    let alive = true;
    setLoading(true);
    setError('');
    setRelated([]);
    api
      .getPhoto(id)
      .then((p) => {
        if (!alive) return;
        setPhoto(p);
        api.getRelatedPhotos(id).then((r) => alive && setRelated(r)).catch(() => {});
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => load(), [load]);

  const { toggleLike, toggleBookmark } = usePhotoActions(setPhoto);
  const updateRelated = useCallback(
    (next) => setRelated((prev) => prev.map((p) => (p._id === next._id ? next : p))),
    []
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied.');
    } catch {
      toast.error('Could not copy the link. Copy it from the address bar instead.');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deletePhoto(photo._id);
      toast.success('Photograph deleted.');
      navigate(`/u/${user.username}`);
    } catch (e) {
      toast.error(e.message);
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (loading) return <Spinner label="Loading photograph" className="min-h-[60vh]" />;
  if (error) return <ErrorState message={error} onRetry={error.includes('does not exist') ? undefined : load} />;

  const canDelete = user && (user.role === 'admin' || user._id === photo.userId);

  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-8 pt-6 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        <div className="flex items-start justify-center overflow-hidden rounded-3xl bg-sand">
          <SmartImage src={photo.imageUrl} width={1600} alt={photo.caption} loading="eager" className="max-h-[82vh] w-full object-contain" />
        </div>

        <aside className="lg:py-2">
          <Link to={`/u/${photo.user.username}`} className="flex items-center gap-3">
            <Avatar user={photo.user} size={48} />
            <span>
              <span className="block font-semibold leading-tight">{photo.user.name}</span>
              <span className="text-sm text-mute">@{photo.user.username} · {formatDate(photo.createdAt)}</span>
            </span>
          </Link>

          <h1 className="mt-7 text-3xl font-semibold leading-tight tracking-tight">{photo.caption}</h1>
          {photo.description && <p className="mt-3 font-serif text-xl leading-relaxed text-ink/80">{photo.description}</p>}

          <div className="mt-6 flex flex-wrap gap-2">
            <Link to={`/explore?category=${photo.category}`} className="chip chip-active">{photo.category}</Link>
            {photo.tags.map((t) => (
              <Link key={t} to={`/explore?q=${encodeURIComponent(t)}`} className="chip">
                <Tag size={13} className="mr-1.5 text-mute" />{t}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <button onClick={() => toggleLike(photo)} aria-pressed={photo.likedByMe} className="btn btn-outline">
              <Heart size={18} className={photo.likedByMe ? 'fill-rose-500 text-rose-500' : ''} />
              {photo.likeCount} {photo.likeCount === 1 ? 'like' : 'likes'}
            </button>
            <button onClick={() => toggleBookmark(photo)} aria-pressed={photo.bookmarkedByMe} className={`btn ${photo.bookmarkedByMe ? 'btn-primary' : 'btn-outline'}`}>
              <Bookmark size={18} className={photo.bookmarkedByMe ? 'fill-paper' : ''} />
              {photo.bookmarkedByMe ? 'Saved' : 'Save'}
            </button>
            <button onClick={copyLink} className="btn btn-ghost" aria-label="Copy link">
              <Link2 size={18} />
            </button>
          </div>

          {canDelete && (
            <button onClick={() => setConfirmOpen(true)} className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-danger hover:underline">
              <Trash2 size={16} /> Delete this photograph
            </button>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-5 text-2xl font-semibold tracking-tight">More in {photo.category}</h2>
          <MasonryGrid photos={related} onUpdate={updateRelated} />
        </section>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this photograph?"
        message="It will be removed from the platform, along with its likes, bookmarks and any challenge entry. This cannot be undone."
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
