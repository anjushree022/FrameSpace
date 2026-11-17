import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Checking your session" className="min-h-[60vh]" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (adminOnly && user.role !== 'admin') {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admins only"
        action={<Link to="/explore" className="btn btn-primary">Back to Explore</Link>}
      >
        You do not have permission to open this page.
      </EmptyState>
    );
  }
  return children;
}
