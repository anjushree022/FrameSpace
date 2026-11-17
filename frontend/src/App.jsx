
import { useEffect } from 'react';
import {
  Outlet,
  Route,
  Routes,
  useLocation
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Explore from './pages/Explore';
import PhotoDetail from './pages/PhotoDetail';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Bookmarks from './pages/Bookmarks';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/ChallengeDetail';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main" className="min-h-[70vh]">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/photo/:id" element={<PhotoDetail />} />
          <Route path="/u/:username" element={<Profile />} />

          <Route path="/challenges" element={<Challenges />} />
          <Route
            path="/challenges/:id"
            element={<ChallengeDetail />}
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
