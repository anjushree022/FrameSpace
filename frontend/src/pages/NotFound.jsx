import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <EmptyState
      icon={Camera}
      title="This frame is out of focus"
      action={<Link to="/explore" className="btn btn-primary">Back to Explore</Link>}
    >
      The page you are looking for does not exist or has moved.
    </EmptyState>
  );
}
