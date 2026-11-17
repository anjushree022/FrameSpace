import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2 } from 'lucide-react';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ACCEPTED_TYPES, MAX_UPLOAD_MB, USERNAME_RE } from '../utils/constants';
import { squareAvatar } from '../utils/imageTools';
import * as api from '../services/api';

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [form, setForm] = useState({ name: user.name, username: user.username, bio: user.bio || '' });
  const [image, setImage] = useState(user.profileImage || '');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const pickImage = async (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) return setErrors((e) => ({ ...e, image: 'Use a JPEG, PNG or WebP image.' }));
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return setErrors((e) => ({ ...e, image: `Images must be under ${MAX_UPLOAD_MB} MB.` }));
    try {
      setImage(await squareAvatar(file));
      setErrors((e) => ({ ...e, image: undefined }));
    } catch (err) {
      setErrors((e) => ({ ...e, image: err.message }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (form.name.trim().length < 2) found.name = 'Enter your name (at least 2 characters).';
    if (!USERNAME_RE.test(form.username)) found.username = 'Use 3-20 letters, numbers, dots or underscores.';
    if (form.bio.length > 160) found.bio = 'Keep your bio under 160 characters.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const updated = await api.updateProfile({ ...form, profileImage: image });
      setUser(updated);
      toast.success('Profile updated.');
      navigate(`/u/${updated.username}`);
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Edit profile</h1>

      <form onSubmit={submit} noValidate className="mt-8 space-y-6">
        <div className="flex items-center gap-5">
          <Avatar user={{ ...user, profileImage: image }} size={88} />
          <div>
            <button type="button" onClick={() => inputRef.current?.click()} className="btn btn-outline"><Camera size={16} /> Change picture</button>
            {image && <button type="button" onClick={() => setImage('')} className="ml-2 text-sm text-mute hover:text-ink">Remove</button>}
            <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(',')} className="sr-only" aria-label="Choose profile picture" onChange={(e) => pickImage(e.target.files?.[0])} />
            {errors.image && <p role="alert" className="error-text">{errors.image}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="name" className="label">Name</label>
          <input id="name" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} className={`field ${errors.name ? 'field-error' : ''}`} />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="username" className="label">Username</label>
          <input id="username" value={form.username} onChange={set('username')} aria-invalid={!!errors.username} className={`field ${errors.username ? 'field-error' : ''}`} />
          {errors.username && <p className="error-text">{errors.username}</p>}
        </div>
        <div>
          <label htmlFor="bio" className="label">Bio</label>
          <textarea id="bio" rows={3} value={form.bio} onChange={set('bio')} maxLength={160} aria-invalid={!!errors.bio} className={`field resize-none ${errors.bio ? 'field-error' : ''}`} placeholder="What do you like to photograph?" />
          <div className="mt-1 flex justify-between text-xs text-mute">
            <span>{errors.bio && <span className="text-danger">{errors.bio}</span>}</span>
            <span>{form.bio.length}/160</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="btn btn-accent !px-8">
            {busy && <Loader2 size={16} className="animate-spin" />} Save changes
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
