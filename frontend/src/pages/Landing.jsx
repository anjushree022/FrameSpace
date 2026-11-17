import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MasonryGrid from '../components/MasonryGrid';
import ChallengeCard from '../components/ChallengeCard';
import SmartImage from '../components/SmartImage';
import ErrorState from '../components/ErrorState';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const COLUMN_OFFSETS = ['mt-0', 'mt-10 sm:mt-16', 'mt-4 sm:mt-6'];

function HeroCollage({ photos }) {
  const columns = [0, 1, 2].map((c) => photos.filter((_, i) => i % 3 === c));
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4" aria-label="Featured photographs">
      {columns.map((col, ci) => (
        <div key={ci} className={`flex flex-col gap-2.5 sm:gap-4 ${COLUMN_OFFSETS[ci]}`}>
          {col.map((p, i) => (
            <Link
              key={p._id}
              to={`/photo/${p._id}`}
              className="rise block overflow-hidden rounded-2xl bg-sand sm:rounded-3xl"
              style={{ aspectRatio: `${p.width} / ${p.height}`, animationDelay: `${ci * 120 + i * 90}ms` }}
              aria-label={`Open “${p.caption}”`}
            >
              <SmartImage src={p.imageUrl} width={600} alt={p.caption} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4" aria-hidden="true">
      {[0, 1, 2].map((c) => (
        <div key={c} className={`flex flex-col gap-2.5 sm:gap-4 ${COLUMN_OFFSETS[c]}`}>
          {[1.25, 0.8, 1].map((r, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-sand sm:rounded-3xl" style={{ aspectRatio: String(1 / r) }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([api.listPhotos({ sort: 'popular', limit: 21 }), api.listChallenges()])
      .then(([p, c]) => {
        setPhotos(p.photos);
        setChallenges(c);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const updatePhoto = useCallback(
    (next) => setPhotos((prev) => prev.map((p) => (p._id === next._id ? next : p))),
    []
  );

  const hero = photos.slice(0, 9);
  const featured = photos.slice(9, 21);
  const featuredChallenges = [...challenges]
    .sort((a, b) => ['active', 'upcoming', 'closed'].indexOf(a.status) - ['active', 'upcoming', 'closed'].indexOf(b.status))
    .slice(0, 3);

  return (
    <div>
      <section className="mx-auto grid max-w-[1500px] items-center gap-10 px-4 pb-6 pt-8 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14 lg:pt-14">
        <div className="max-w-xl">
          <h1 className="text-[clamp(2.9rem,7vw,5.6rem)] font-semibold leading-[0.98] tracking-tight">
            Every Frame Tells a Story.
          </h1>
          <p className="mt-6 max-w-md font-serif text-xl leading-snug text-mute">
            FrameSpace is a home for people who see the world through a lens. Share your photographs, save the ones that
            stay with you, and join a new challenge every week.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/explore" className="btn btn-primary !px-7 !py-3">Explore</Link>
            {user ? (
              <Link to="/upload" className="btn btn-accent !px-7 !py-3">Upload a photograph</Link>
            ) : (
              <Link to="/register" className="btn btn-accent !px-7 !py-3">Sign up</Link>
            )}
          </div>
        </div>

        {error ? <ErrorState message={error} onRetry={load} /> : loading ? <HeroSkeleton /> : <HeroCollage photos={hero} />}
      </section>

      {!error && (featured.length > 0 || loading) && (
        <section className="mx-auto mt-20 max-w-[1800px] px-4 sm:px-6" aria-labelledby="featured-heading">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 id="featured-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Featured this week</h2>
            <Link to="/explore" className="btn btn-outline">See all photographs</Link>
          </div>
          {loading ? (
            <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5" aria-hidden="true">
              {[1.2, 0.8, 1, 1.4, 0.9, 1.1, 0.8, 1.3].map((r, i) => (
                <div key={i} className="mb-4 animate-pulse break-inside-avoid rounded-2xl bg-sand" style={{ aspectRatio: String(1 / r) }} />
              ))}
            </div>
          ) : (
            <MasonryGrid photos={featured} onUpdate={updatePhoto} />
          )}
        </section>
      )}

      {featuredChallenges.length > 0 && (
        <section className="mx-auto mt-24 max-w-[1500px] px-4 sm:px-6" aria-labelledby="challenges-heading">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 id="challenges-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Weekly challenges</h2>
              <p className="mt-1 font-serif text-lg text-mute">One theme, one photograph each. Pick up your camera.</p>
            </div>
            <Link to="/challenges" className="btn btn-outline">All challenges</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredChallenges.map((c) => <ChallengeCard key={c._id} challenge={c} />)}
          </div>
        </section>
      )}

      {!user && (
        <section className="mx-auto mt-24 max-w-[1500px] px-4 sm:px-6">
          <div className="rounded-[2rem] bg-cyano px-6 py-14 text-center text-white sm:px-12">
            <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Your next frame is waiting.</h2>
            <p className="mx-auto mt-3 max-w-md font-serif text-xl text-white/80">
              Create a free profile, upload your first photograph and see who stops to look.
            </p>
            <Link to="/register" className="btn mt-8 bg-white !px-8 !py-3 text-[#24211C] hover:bg-neutral-100">Create your profile</Link>
          </div>
        </section>
      )}
    </div>
  );
}
