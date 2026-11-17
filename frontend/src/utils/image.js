// Asks Cloudinary for a right-sized, auto-format copy of an uploaded photograph.
// Other URLs (sample photographs) are returned untouched.
export function optimizeUrl(url, width) {
  if (!url || !width || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}
