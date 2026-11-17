import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/explore';

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <Navigate to={from} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.identifier.trim()) next.identifier = 'Enter your email or username.';
    if (!form.password) next.password = 'Enter your password.';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const u = await login(form);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}.`);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
      <div className="relative hidden overflow-hidden rounded-[2rem] bg-sand lg:block">
        <SmartImage
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&h=1250&q=80"
          alt="Mountain valley at first light"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mx-auto w-full max-w-md self-center">
        <h1 className="text-4xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-2 font-serif text-xl text-mute">Pick up where you left off.</p>

        <form onSubmit={submit} noValidate className="mt-8 space-y-5">
          {formError && (
            <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{formError}</p>
          )}
          <div>
            <label htmlFor="identifier" className="label">Email or username</label>
            <input id="identifier" autoComplete="username" value={form.identifier} onChange={set('identifier')} aria-invalid={!!errors.identifier} className={`field ${errors.identifier ? 'field-error' : ''}`} />
            {errors.identifier && <p className="error-text">{errors.identifier}</p>}
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <div className="relative">
              <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={set('password')} aria-invalid={!!errors.password} className={`field pr-12 ${errors.password ? 'field-error' : ''}`} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-mute hover:text-ink">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          <button type="submit" disabled={busy} className="btn btn-primary w-full !py-3">
            {busy && <Loader2 size={16} className="animate-spin" />} Log in
          </button>
        </form>

        <p className="mt-6 text-sm text-mute">
          New to FrameSpace? <Link to="/register" className="font-medium text-cyano-text hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
