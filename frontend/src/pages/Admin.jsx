import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, Images, Loader2, Pencil, Plus, Trash2, Trophy, Users } from 'lucide-react';
import Avatar from '../components/Avatar';
import SmartImage from '../components/SmartImage';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { CHALLENGE_STATUS } from '../utils/constants';
import { deadlineLabel, formatDate, toInputDate } from '../utils/format';
import * as api from '../services/api';

const TABS = [
  ['overview', 'Overview'],
  ['users', 'Users'],
  ['photos', 'Photographs'],
  ['challenges', 'Challenges'],
];

export default function Admin() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'overview';

  return (
    <div className="mx-auto max-w-[1300px] px-4 pb-8 pt-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Admin dashboard</h1>
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-full bg-sand p-1" role="tablist">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setParams({ tab: key })}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${tab === key ? 'bg-paper shadow-sm' : 'text-mute hover:text-ink'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {tab === 'overview' && <Overview />}
        {tab === 'users' && <UsersTab />}
        {tab === 'photos' && <PhotosTab />}
        {tab === 'challenges' && <ChallengesTab />}
      </div>
    </div>
  );
}

/* A small hook to load admin data with loading and error state. */
function useAsync(fn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    let alive = true;
    setLoading(true);
    setError('');
    fn()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [fn]);
  useEffect(() => load(), [load]);
  return { data, setData, loading, error, reload: load };
}

function Overview() {
  const { data, loading, error, reload } = useAsync(api.adminGetStats);
  if (loading) return <Spinner label="Loading statistics" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const cards = [
    ['Users', data.users, Users],
    ['Photographs', data.photos, Images],
    ['Likes', data.likes, Heart],
    ['Challenge entries', data.submissions, Trophy],
  ];
  const max = Math.max(1, ...data.byCategory.map((c) => c.count));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="rounded-3xl border border-line bg-surface/70 p-5">
            <Icon size={20} className="text-cyano-text" />
            <p className="mt-4 text-4xl font-semibold tracking-tight">{value}</p>
            <p className="text-sm text-mute">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="rounded-3xl border border-line bg-surface/70 p-6" aria-labelledby="cat-heading">
          <h2 id="cat-heading" className="text-lg font-semibold">Photographs by category</h2>
          <ul className="mt-5 space-y-3">
            {data.byCategory.map((c) => (
              <li key={c.name} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-sm">
                <span>{c.name}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-sand">
                  <span className="block h-full rounded-full bg-cyano" style={{ width: `${(c.count / max) * 100}%` }} />
                </span>
                <span className="text-right text-mute">{c.count}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-line bg-surface/70 p-6">
          <h2 className="text-lg font-semibold">This week</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between"><dt className="text-mute">New photographs</dt><dd className="font-semibold">{data.photosThisWeek}</dd></div>
            <div className="flex justify-between"><dt className="text-mute">Active challenges</dt><dd className="font-semibold">{data.activeChallenges}</dd></div>
            <div className="flex justify-between"><dt className="text-mute">Total bookmarks</dt><dd className="font-semibold">{data.bookmarks}</dd></div>
            <div className="flex justify-between"><dt className="text-mute">Total challenges</dt><dd className="font-semibold">{data.challenges}</dd></div>
          </dl>
        </section>
      </div>
    </div>
  );
}

function UsersTab() {
  const { data, loading, error, reload } = useAsync(api.adminListUsers);
  if (loading) return <Spinner label="Loading users" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <div className="overflow-x-auto rounded-3xl border border-line bg-surface/70">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line text-mute">
          <tr>
            <th className="px-5 py-3 font-medium">User</th>
            <th className="px-5 py-3 font-medium">Email</th>
            <th className="px-5 py-3 font-medium">Role</th>
            <th className="px-5 py-3 font-medium">Photos</th>
            <th className="px-5 py-3 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <tr key={u._id} className="border-b border-line/60 last:border-0">
              <td className="px-5 py-3">
                <Link to={`/u/${u.username}`} className="flex items-center gap-3 hover:underline">
                  <Avatar user={u} size={34} />
                  <span><span className="block font-medium leading-tight">{u.name}</span><span className="text-mute">@{u.username}</span></span>
                </Link>
              </td>
              <td className="px-5 py-3 text-mute">{u.email}</td>
              <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.role === 'admin' ? 'bg-cyano-soft text-cyano-text' : 'bg-sand'}`}>{u.role}</span></td>
              <td className="px-5 py-3">{u.photoCount}</td>
              <td className="px-5 py-3 text-mute">{formatDate(u.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PhotosTab() {
  const toast = useToast();
  const { data, setData, loading, error, reload } = useAsync(api.adminListPhotos);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await api.deletePhoto(target._id);
      setData((d) => d.filter((p) => p._id !== target._id));
      toast.success('Photograph removed.');
      setTarget(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading photographs" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data.length) return <EmptyState icon={Images} title="No photographs">Nothing has been uploaded yet.</EmptyState>;

  return (
    <>
      <div className="overflow-x-auto rounded-3xl border border-line bg-surface/70">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-mute">
            <tr>
              <th className="px-5 py-3 font-medium">Photograph</th>
              <th className="px-5 py-3 font-medium">Photographer</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Likes</th>
              <th className="px-5 py-3 font-medium">Uploaded</th>
              <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p._id} className="border-b border-line/60 last:border-0">
                <td className="px-5 py-3">
                  <Link to={`/photo/${p._id}`} className="flex items-center gap-3 hover:underline">
                    <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand"><SmartImage src={p.imageUrl} width={120} alt="" className="h-full w-full object-cover" /></span>
                    <span className="max-w-[16rem] truncate font-medium">{p.caption}</span>
                  </Link>
                </td>
                <td className="px-5 py-3 text-mute">@{p.user.username}</td>
                <td className="px-5 py-3">{p.category}</td>
                <td className="px-5 py-3">{p.likeCount}</td>
                <td className="px-5 py-3 text-mute">{formatDate(p.createdAt)}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => setTarget(p)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-danger hover:bg-danger-soft">
                    <Trash2 size={15} /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={!!target}
        title="Remove this photograph?"
        message={target ? `“${target.caption}” by @${target.user.username} will be removed along with its likes, bookmarks and challenge entry.` : ''}
        confirmLabel="Remove"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setTarget(null)}
      />
    </>
  );
}

const EMPTY_CHALLENGE = { title: '', theme: '', description: '', startDate: '', deadline: '', status: 'upcoming' };

function ChallengesTab() {
  const toast = useToast();
  const { data, setData, loading, error, reload } = useAsync(api.listChallenges);
  const [editing, setEditing] = useState(null); // null | 'new' | challenge
  const [form, setForm] = useState(EMPTY_CHALLENGE);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openNew = () => {
    setForm(EMPTY_CHALLENGE);
    setErrors({});
    setEditing('new');
  };
  const openEdit = (c) => {
    setForm({ title: c.title, theme: c.theme, description: c.description, startDate: toInputDate(c.startDate), deadline: toInputDate(c.deadline), status: c.status });
    setErrors({});
    setEditing(c);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (editing === 'new') {
        await api.createChallenge(form);
        toast.success('Challenge created.');
      } else {
        await api.updateChallenge(editing._id, form);
        toast.success('Challenge updated.');
      }
      setEditing(null);
      const fresh = await api.listChallenges();
      setData(fresh);
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      else toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await api.deleteChallenge(target._id);
      setData((d) => d.filter((c) => c._id !== target._id));
      toast.success('Challenge deleted.');
      setTarget(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner label="Loading challenges" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const fieldProps = (k) => ({ id: `ch-${k}`, value: form[k], onChange: set(k), 'aria-invalid': !!errors[k], className: `field ${errors[k] ? 'field-error' : ''}` });

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button onClick={openNew} className="btn btn-accent"><Plus size={16} /> New challenge</button>
      </div>

      {data.length === 0 ? (
        <EmptyState icon={Trophy} title="No challenges yet" action={<button onClick={openNew} className="btn btn-accent">Create the first one</button>}>
          Create a weekly theme for photographers to enter.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {data.map((c) => (
            <li key={c._id} className="flex flex-wrap items-center gap-4 rounded-3xl border border-line bg-surface/70 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/challenges/${c._id}`} className="text-lg font-semibold tracking-tight hover:underline">{c.title}</Link>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.status === 'active' ? 'bg-cyano text-white' : c.status === 'closed' ? 'bg-ink/80 text-paper' : 'bg-sand'}`}>{CHALLENGE_STATUS[c.status]}</span>
                </div>
                <p className="mt-1 text-sm text-mute">Theme: {c.theme} · {deadlineLabel(c)} · {c.submissionCount} {c.submissionCount === 1 ? 'entry' : 'entries'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="btn btn-outline !px-4"><Pencil size={15} /> Edit</button>
                <button onClick={() => setTarget(c)} className="btn btn-outline !px-4 !text-danger"><Trash2 size={15} /> Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!editing} onClose={() => !saving && setEditing(null)} title={editing === 'new' ? 'New challenge' : 'Edit challenge'}>
        <form onSubmit={save} noValidate className="space-y-4">
          <div>
            <label htmlFor="ch-title" className="label">Title</label>
            <input {...fieldProps('title')} />
            {errors.title && <p className="error-text">{errors.title}</p>}
          </div>
          <div>
            <label htmlFor="ch-theme" className="label">Theme</label>
            <input {...fieldProps('theme')} placeholder="Reflections" />
            {errors.theme && <p className="error-text">{errors.theme}</p>}
          </div>
          <div>
            <label htmlFor="ch-description" className="label">Description</label>
            <textarea {...fieldProps('description')} rows={3} />
            {errors.description && <p className="error-text">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ch-startDate" className="label">Start date</label>
              <input type="date" {...fieldProps('startDate')} />
              {errors.startDate && <p className="error-text">{errors.startDate}</p>}
            </div>
            <div>
              <label htmlFor="ch-deadline" className="label">Deadline</label>
              <input type="date" {...fieldProps('deadline')} />
              {errors.deadline && <p className="error-text">{errors.deadline}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="ch-status" className="label">Status</label>
            <select {...fieldProps('status')}>
              {Object.entries(CHALLENGE_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            {errors.status && <p className="error-text">{errors.status}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-outline" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" />} {editing === 'new' ? 'Create challenge' : 'Save changes'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!target}
        title="Delete this challenge?"
        message={target ? `“${target.title}” and its ${target.submissionCount} ${target.submissionCount === 1 ? 'entry' : 'entries'} will be removed. The photographs themselves stay on the platform.` : ''}
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setTarget(null)}
      />
    </>
  );
}
