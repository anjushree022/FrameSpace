import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-[1800px] flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
        <div>
          <Logo />
          <p className="mt-2 font-serif text-base text-mute">Every frame tells a story.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-mute" aria-label="Footer">
          <Link to="/explore" className="hover:text-ink">Explore</Link>
          <Link to="/challenges" className="hover:text-ink">Challenges</Link>
          <Link to="/upload" className="hover:text-ink">Upload</Link>
          <Link to="/bookmarks" className="hover:text-ink">Bookmarks</Link>
        </nav>
        <p className="text-sm text-mute">© {new Date().getFullYear()} FrameSpace</p>
      </div>
    </footer>
  );
}
