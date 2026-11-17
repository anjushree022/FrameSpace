import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import MasonryGrid from '../components/MasonryGrid';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { plural } from '../utils/format';
import * as api from '../services/api';

export default function Bookmarks() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api
      .listBookmarks()
      .then((p) => alive && setPhotos(p))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => load(), [load]);

  // Un-bookmarking from this page removes the photograph from the list.
  const updatePhoto = useCallback(
    (next) =>
      setPhotos((prev) =>
        next.bookmarkedByMe ? prev.map((p) => (p._id === next._id ? next : p)) : prev.filter((p) => p._id !== next._id)
      ),
    []
  );

  return (
    <div className="mx-auto max-w-[1800px] px-4 pb-8 pt-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Saved photographs</h1>
        {!loading && !error && <p className="mt-1 font-serif text-xl text-mute">{plural(photos.length, 'photograph')}</p>}
      </div>

      {loading ? (
        <Spinner label="Loading your bookmarks" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : photos.length === 0 ? (
        <EmptyState icon={Bookmark} title="Nothing saved yet" action={<Link to="/explore" className="btn btn-primary">Explore photographs</Link>}>
          Tap the bookmark on any photograph to keep it here.
        </EmptyState>
      ) : (
        <MasonryGrid photos={photos} onUpdate={updatePhoto} />
      )}
    </div>
  );
}
