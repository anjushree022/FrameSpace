import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Bookmark, LogOut, Menu, Plus, Search, Settings, ShieldCheck, User, X } from 'lucide-react';
import Logo from './Logo';
import Avatar from './Avatar';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore' },
  { to: '/challenges', label: 'Challenges' },
];

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-ink text-paper' : 'text-ink/70 hover:bg-sand hover:text-ink'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  const urlQuery = params.get('q') || '';
  useEffect(() => {
    setQuery(location.pathname === '/explore' ? urlQuery : '');
  }, [location.pathname, urlQuery]);

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDown = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore');
  };

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out.');
    navigate('/');
  };

  const searchForm = (idSuffix) => (
    <form onSubmit={submitSearch} role="search" className="relative w-full">
      <label htmlFor={`search-${idSuffix}`} className="sr-only">Search photographs</label>
      <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
      <input
        id={`search-${idSuffix}`}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search photographs, tags or people"
        className="w-full rounded-full border border-transparent bg-sand py-2.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-mute/80 focus:border-cyano focus:bg-surface"
      />
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1800px] items-center gap-3 px-4 py-3 sm:px-6">
        <button
          className="rounded-full p-2 hover:bg-sand lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" aria-label="FrameSpace home" className="shrink-0">
          <Logo />
        </Link>

        <nav className="ml-3 hidden items-center gap-1 lg:flex" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="mx-2 hidden max-w-xl flex-1 md:block">{searchForm('desktop')}</div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Link to="/upload" className="btn btn-accent !px-3.5 sm:!px-5">
            <Plus size={17} />
            <span className="hidden sm:inline">Upload</span>
          </Link>

          {user ? (
            <>
              <Link to="/bookmarks" aria-label="Bookmarks" className="rounded-full p-2.5 text-ink/80 hover:bg-sand hover:text-ink">
                <Bookmark size={20} />
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Account menu"
                  aria-expanded={menuOpen}
                  className="rounded-full ring-offset-2 ring-offset-paper transition hover:ring-2 hover:ring-line"
                >
                  <Avatar user={user} size={36} />
                </button>
                {menuOpen && (
                  <div className="toast-in absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-paper p-1.5 shadow-xl">
                    <div className="px-3 py-2.5">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-mute">@{user.username}</p>
                    </div>
                    <hr className="border-line" />
                    <MenuLink to={`/u/${user.username}`} icon={User}>Your profile</MenuLink>
                    <MenuLink to="/bookmarks" icon={Bookmark}>Saved photographs</MenuLink>
                    <MenuLink to="/settings/profile" icon={Settings}>Edit profile</MenuLink>
                    {user.role === 'admin' && <MenuLink to="/admin" icon={ShieldCheck}>Admin dashboard</MenuLink>}
                    <hr className="my-1 border-line" />
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-sand">
                      <LogOut size={17} /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost hidden sm:inline-flex">Log in</Link>
              <Link to="/register" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">{searchForm('mobile')}</div>

      {mobileOpen && (
        <nav className="border-t border-line px-4 py-3 lg:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            {!user && (
              <NavLink to="/login" className={linkClass}>Log in</NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

function MenuLink({ to, icon: Icon, children }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-sand">
      <Icon size={17} /> {children}
    </Link>
  );
}
