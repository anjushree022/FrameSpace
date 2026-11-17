export function formatDate(iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Date(iso).toLocaleDateString('en-GB', opts);
}

export function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatDate(iso);
}

export function isChallengeOpen(c) {
  return c.status === 'active' && new Date(c.deadline).getTime() > Date.now();
}

export function deadlineLabel(c) {
  const end = new Date(c.deadline);
  if (c.status === 'upcoming') return `Opens ${formatDate(c.startDate, { day: 'numeric', month: 'short' })}`;
  if (c.status === 'closed' || end.getTime() < Date.now()) return `Closed ${formatDate(end, { day: 'numeric', month: 'short' })}`;
  const days = Math.ceil((end.getTime() - Date.now()) / 86400000);
  if (days <= 1) return 'Ends today';
  return `${days} days left`;
}

// ISO string -> value for <input type="date">
export function toInputDate(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}
