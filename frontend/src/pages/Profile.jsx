import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Camera, Heart, Images, Pencil } from 'lucide-react';
import Avatar from '../components/Avatar';
import MasonryGrid from '../components/MasonryGrid';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/format';
import * as api from '../services/api';

export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [data, setData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api
      .getProfile(username)
      .then((res) => {
        if (!alive) return;
        setData(res);
        setPhotos(res.photos);
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [username]);

  useEffect(() => load(), [load]);

  const updatePhoto = useCallback(
    (next) => setPhotos((prev) => prev.map((p) => (p._id === next._id ? next : p))),
    []
  );

  if (loading) return <Spinner label="Loading profile" className="min-h-[60vh]" />;
  if (error) return <ErrorState message={error} onRetry={error.includes('could not find') ? undefined : load} />;

  const { user } = data;
  const isOwn = me && me._id === user._id;
  const likes = photos.reduce((sum, p) => sum + p.likeCount, 0);

  return (
    <div className="mx-auto max-w-[1800px] px-4 pb-8 pt-8 sm:px-6">
      <header className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Avatar user={user} size={112} className="ring-4 ring-sand" />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{user.name}</h1>
        <p className="mt-1 text-mute">@{user.username} · Joined {formatDate(user.createdAt, { month: 'long', year: 'numeric' })}</p>
        {user.bio && <p className="mt-4 max-w-md font-serif text-xl leading-snug text-ink/80">{user.bio}</p>}

        <dl className="mt-6 flex items-center gap-8">
          <div>
            <dt className="flex items-center justify-center gap-1.5 text-sm text-mute"><Images size={15} /> Photographs</dt>
            <dd className="text-2xl font-semibold">{photos.length}</dd>
          </div>
          <div>
            <dt className="flex items-center justify-center gap-1.5 text-sm text-mute"><Heart size={15} /> Likes received</dt>
            <dd className="text-2xl font-semibold">{likes}</dd>
          </div>
        </dl>

        {isOwn && (
          <div className="mt-6 flex gap-3">
            <Link to="/settings/profile" className="btn btn-outline"><Pencil size={16} /> Edit profile</Link>
            <Link to="/upload" className="btn btn-accent">Upload</Link>
          </div>
        )}
      </header>

      <div className="mt-12">
        {photos.length === 0 ? (
          <EmptyState
            icon={Camera}
            title={isOwn ? 'Your gallery is empty' : 'No photographs yet'}
            action={isOwn ? <Link to="/upload" className="btn btn-accent">Upload your first photograph</Link> : <Link to="/explore" className="btn btn-primary">Explore other photographers</Link>}
          >
            {isOwn ? 'Share a frame and it will show up here.' : `${user.name.split(' ')[0]} has not shared anything yet.`}
          </EmptyState>
        ) : (
          <MasonryGrid photos={photos} onUpdate={updatePhoto} />
        )}
      </div>
    </div>
  );
}
