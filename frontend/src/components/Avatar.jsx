import { useEffect, useState } from 'react';

const TONES = ['#C9D8EA', '#EBD9C2', '#D5E3CF', '#E6CFD3', '#D9D3EA', '#F0E2B6'];

export default function Avatar({ user, size = 36, className = '' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [user?.profileImage]);

  const name = user?.name || user?.username || '?';
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const tone = TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
  const style = { width: size, height: size, fontSize: size * 0.38 };

  if (user?.profileImage && !failed) {
    return (
      <img
        src={user.profileImage}
        alt=""
        style={style}
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ ...style, background: tone }}
      className={`grid shrink-0 place-items-center rounded-full font-semibold text-[#24211C]/70 ${className}`}
    >
      {initials}
    </span>
  );
}
