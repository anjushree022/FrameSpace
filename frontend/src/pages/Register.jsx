import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EMAIL_RE, PASSWORD_RE, USERNAME_RE } from '../utils/constants';

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <Navigate to="/explore" replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your name (at least 2 characters).';
    if (!USERNAME_RE.test(form.username)) e.username = 'Use 3-20 letters, numbers, dots or underscores.';
    if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email address.';
    if (!PASSWORD_RE.test(form.password)) e.password = 'Use at least 8 characters with a letter and a number.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      await register(form);
      toast.success('Your account is ready. Welcome to FrameSpace.');
      navigate('/explore', { replace: true });
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      setFormError(err.message);
      setBusy(false);
    }
  };

  const fields = [
    ['name', 'Name', 'text', 'name'],
    ['username', 'Username', 'text', 'username'],
    ['email', 'Email', 'email', 'email'],
  ];

  return (
    <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-14">
      <div className="mx-auto w-full max-w-md self-center">
        <h1 className="text-4xl font-semibold tracking-tight">Create your profile</h1>
        <p className="mt-2 font-serif text-xl text-mute">Free to join. Your first upload is a minute away.</p>

        <form onSubmit={submit} noValidate className="mt-8 space-y-5">
          {formError && <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{formError}</p>}
          {fields.map(([key, label, type, auto]) => (
            <div key={key}>
              <label htmlFor={key} className="label">{label}</label>
              <input id={key} type={type} autoComplete={auto} value={form[key]} onChange={set(key)} aria-invalid={!!errors[key]} className={`field ${errors[key] ? 'field-error' : ''}`} />
              {errors[key] && <p className="error-text">{errors[key]}</p>}
            </div>
          ))}
          <div>
            <label htmlFor="password" className="label">Password</label>
            <div className="relative">
              <input id="password" type={show ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={set('password')} aria-invalid={!!errors.password} aria-describedby="pw-hint" className={`field pr-12 ${errors.password ? 'field-error' : ''}`} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-mute hover:text-ink">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password ? <p className="error-text">{errors.password}</p> : <p id="pw-hint" className="mt-1.5 text-xs text-mute">At least 8 characters, with a letter and a number.</p>}
          </div>
          <button type="submit" disabled={busy} className="btn btn-accent w-full !py-3">
            {busy && <Loader2 size={16} className="animate-spin" />} Create account
          </button>
        </form>

        <p className="mt-6 text-sm text-mute">
          Already have an account? <Link to="/login" className="font-medium text-cyano-text hover:underline">Log in</Link>
        </p>
      </div>

      <div className="relative hidden overflow-hidden rounded-[2rem] bg-sand lg:block">
        <SmartImage
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&h=1250&q=80"
          alt="Still lake beneath a mountain range"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
