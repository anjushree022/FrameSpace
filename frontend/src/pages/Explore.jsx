import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, SearchX, X } from 'lucide-react';
import MasonryGrid from '../components/MasonryGrid';
import CategoryFilter from '../components/CategoryFilter';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Spinner from '../components/Spinner';
import { CATEGORIES } from '../utils/constants';
import * as api from '../services/api';

const PAGE_SIZE = 20;

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const categoryParam = params.get('category') || '';
  const category = CATEGORIES.includes(categoryParam) ? categoryParam : '';
  const sort = params.get('sort') === 'popular' ? 'popular' : 'newest';

  const [photos, setPhotos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetchFirst = useCallback(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api
      .listPhotos({ q, category, sort, page: 1, limit: PAGE_SIZE })
      .then((res) => {
        if (!alive) return;
        setPhotos(res.photos);
        setTotal(res.total);
        setPage(1);
        setHasMore(res.hasMore);
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [q, category, sort]);

  useEffect(() => fetchFirst(), [fetchFirst]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await api.listPhotos({ q, category, sort, page: page + 1, limit: PAGE_SIZE });
      setPhotos((prev) => [...prev, ...res.photos]);
      setPage(page + 1);
      setHasMore(res.hasMore);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const updatePhoto = useCallback(
    (next) => setPhotos((prev) => prev.map((p) => (p._id === next._id ? next : p))),
    []
  );

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const filtered = q || category;

  return (
    <div className="mx-auto max-w-[1800px] px-4 pb-8 pt-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter value={category} onChange={(c) => setParam('category', c)} />
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-sand p-1 text-sm" role="group" aria-label="Sort photographs">
          {[['newest', 'Newest'], ['popular', 'Popular']].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setParam('sort', value === 'newest' ? '' : value)}
              aria-pressed={sort === value}
              className={`rounded-full px-4 py-1.5 font-medium transition-colors ${sort === value ? 'bg-paper shadow-sm' : 'text-mute hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {q && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Results for “{q}”</h1>
          {!loading && <span className="text-sm text-mute">{total} {total === 1 ? 'photograph' : 'photographs'}</span>}
          <button onClick={() => setParam('q', '')} className="chip !py-1" aria-label="Clear search">
            <X size={14} className="mr-1" /> Clear
          </button>
        </div>
      )}
      {!q && <h1 className="sr-only">Explore photographs</h1>}

      {loading ? (
        <Spinner label="Loading photographs" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchFirst} />
      ) : photos.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No photographs found"
          action={
            filtered ? (
              <Link to="/explore" className="btn btn-primary">Clear search and filters</Link>
            ) : (
              <Link to="/upload" className="btn btn-accent">Upload the first one</Link>
            )
          }
        >
          {filtered ? 'Try a different keyword or category.' : 'Nothing has been shared yet.'}
        </EmptyState>
      ) : (
        <>
          <MasonryGrid photos={photos} onUpdate={updatePhoto} />
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button onClick={loadMore} disabled={loadingMore} className="btn btn-outline !px-8">
                {loadingMore && <Loader2 size={16} className="animate-spin" />}
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
