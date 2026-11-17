import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Loading', className = '' }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-2 py-16 text-mute ${className}`}>
      <Loader2 className="animate-spin" size={20} />
      <span className="text-sm">{label}…</span>
    </div>
  );
}
