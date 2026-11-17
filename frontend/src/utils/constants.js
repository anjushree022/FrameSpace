export const CATEGORIES = [
  'Nature',
  'Street',
  'Architecture',
  'Portraits',
  'Travel',
  'Wildlife',
  'Minimalism',
  'Abstract',
];

export const CHALLENGE_STATUS = { upcoming: 'Upcoming', active: 'Active', closed: 'Closed' };

export const MAX_UPLOAD_MB = 10;
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const USERNAME_RE = /^[a-zA-Z0-9._]{3,20}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
