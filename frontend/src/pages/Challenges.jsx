import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import ChallengeCard from '../components/ChallengeCard';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const SECTIONS = [
  ['active', 'Open now'],
  ['upcoming', 'Coming up'],
  ['closed', 'Past challenges'],
];

export default function Challenges() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api
      .listChallenges()
      .then((c) => alive && setItems(c))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => load(), [load]);

  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-8 pt-8 sm:px-6">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Photography challenges</h1>
          <p className="mt-2 max-w-xl font-serif text-xl text-mute">A new theme every week. Submit one photograph per challenge.</p>
        </div>
        {user?.role === 'admin' && <Link to="/admin?tab=challenges" className="btn btn-outline">Manage challenges</Link>}
      </div>

      {loading ? (
        <Spinner label="Loading challenges" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState icon={Trophy} title="No challenges yet">New themes are announced here every week.</EmptyState>
      ) : (
        <div className="space-y-14">
          {SECTIONS.map(([status, title]) => {
            const list = items.filter((c) => c.status === status);
            if (!list.length) return null;
            return (
              <section key={status} aria-labelledby={`sec-${status}`}>
                <h2 id={`sec-${status}`} className="mb-5 text-2xl font-semibold tracking-tight">{title}</h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((c) => <ChallengeCard key={c._id} challenge={c} />)}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
