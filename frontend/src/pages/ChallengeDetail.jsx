import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Clock, Images, Loader2 } from 'lucide-react';
import MasonryGrid from '../components/MasonryGrid';
import Modal from '../components/Modal';
import SmartImage from '../components/SmartImage';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CHALLENGE_STATUS } from '../utils/constants';
import { deadlineLabel, formatDate, isChallengeOpen, plural } from '../utils/format';
import * as api from '../services/api';

export default function ChallengeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mine, setMine] = useState(null);
  const [selected, setSelected] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api
      .getChallenge(id)
      .then((res) => alive && setData(res))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => load(), [load]);

  const updatePhoto = useCallback(
    (next) =>
      setData((d) => (d ? { ...d, submissions: d.submissions.map((p) => (p._id === next._id ? { ...next, submittedAt: p.submittedAt } : p)) } : d)),
    []
  );

  const openPicker = async () => {
    if (!user) {
      toast.info('Log in to submit a photograph.');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setPickerOpen(true);
    setSelected('');
    setMine(null);
    try {
      setMine(await api.getUserPhotos(user.username));
    } catch (e) {
      toast.error(e.message);
      setPickerOpen(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.submitToChallenge(id, selected);
      toast.success('Your photograph has been submitted.');
      setPickerOpen(false);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) return <Spinner label="Loading challenge" className="min-h-[60vh]" />;
  if (error) return <ErrorState message={error} onRetry={error.includes('does not exist') ? undefined : load} />;

  const { challenge: c, submissions } = data;
  const open = isChallengeOpen(c);

  return (
    <div className="mx-auto max-w-[1800px] px-4 pb-8 pt-8 sm:px-6">
      <Link to="/challenges" className="text-sm text-mute hover:text-ink">All challenges</Link>

      <header className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className={`rounded-full px-3 py-1 font-medium ${c.status === 'active' ? 'bg-cyano text-white' : c.status === 'closed' ? 'bg-ink/80 text-paper' : 'bg-sand'}`}>{CHALLENGE_STATUS[c.status]}</span>
            <span className="chip !py-1">Theme: {c.theme}</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{c.title}</h1>
          <p className="mt-4 max-w-2xl font-serif text-xl leading-relaxed text-ink/80">{c.description}</p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mute">
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={16} />{formatDate(c.startDate)} to {formatDate(c.deadline)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={16} />{deadlineLabel(c)}</span>
            <span className="inline-flex items-center gap-1.5"><Images size={16} />{plural(c.submissionCount, 'entry').replace('entrys', 'entries')}</span>
          </div>
        </div>

        <div className="lg:text-right">
          {c.mySubmission ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-cyano-soft px-4 py-2.5 text-sm font-medium text-cyano-text">
              <CheckCircle2 size={17} /> You have entered this challenge
            </p>
          ) : open ? (
            <button onClick={openPicker} className="btn btn-accent !px-8 !py-3">Submit a photograph</button>
          ) : (
            <p className="rounded-full bg-sand px-4 py-2.5 text-sm text-mute">
              {c.status === 'upcoming' ? 'Submissions open when the challenge starts.' : 'Submissions are closed.'}
            </p>
          )}
        </div>
      </header>

      <section className="mt-12" aria-labelledby="entries-heading">
        <h2 id="entries-heading" className="mb-5 text-2xl font-semibold tracking-tight">Entries</h2>
        {submissions.length === 0 ? (
          <EmptyState icon={Images} title="No entries yet" action={open && !c.mySubmission ? <button onClick={openPicker} className="btn btn-accent">Be the first to submit</button> : null}>
            {open ? 'Be the first to share a photograph for this theme.' : 'Nobody entered this challenge.'}
          </EmptyState>
        ) : (
          <MasonryGrid photos={submissions} onUpdate={updatePhoto} />
        )}
      </section>

      <Modal open={pickerOpen} onClose={() => !submitting && setPickerOpen(false)} title={`Choose a photograph for “${c.title}”`} wide>
        {!mine ? (
          <Spinner label="Loading your photographs" className="py-10" />
        ) : mine.length === 0 ? (
          <EmptyState title="You have nothing to submit yet" action={<Link to="/upload" className="btn btn-accent">Upload a photograph</Link>}>
            Upload a photograph first, then come back to enter it.
          </EmptyState>
        ) : (
          <>
            <p className="mb-4 text-sm text-mute">You can submit one photograph per challenge.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" role="radiogroup" aria-label="Your photographs">
              {mine.map((p) => (
                <button
                  key={p._id}
                  role="radio"
                  aria-checked={selected === p._id}
                  onClick={() => setSelected(p._id)}
                  className={`relative aspect-square overflow-hidden rounded-2xl bg-sand ring-offset-2 ring-offset-paper transition ${selected === p._id ? 'ring-4 ring-cyano' : 'hover:opacity-90'}`}
                >
                  <SmartImage src={p.imageUrl} width={400} alt={p.caption} className="h-full w-full object-cover" />
                  {selected === p._id && <CheckCircle2 size={22} className="absolute right-2 top-2 rounded-full bg-cyano text-white" />}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn btn-outline" onClick={() => setPickerOpen(false)} disabled={submitting}>Cancel</button>
              <button className="btn btn-accent" onClick={submit} disabled={!selected || submitting}>
                {submitting && <Loader2 size={16} className="animate-spin" />} Submit entry
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
