import { Link } from 'react-router-dom';
import { Bookmark, Heart } from 'lucide-react';
import SmartImage from './SmartImage';
import Avatar from './Avatar';
import usePhotoActions from '../hooks/usePhotoActions';

const reveal =
  'opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100';

export default function PhotoCard({ photo, onUpdate }) {
  const { toggleLike, toggleBookmark } = usePhotoActions(onUpdate);

  return (
    <article className="group relative mb-3 break-inside-avoid sm:mb-4">
      <Link
        to={`/photo/${photo._id}`}
        aria-label={`Open “${photo.caption}” by ${photo.user.username}`}
        className="block overflow-hidden rounded-2xl bg-sand"
        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      >
        <SmartImage
          src={photo.imageUrl}
          width={700}
          alt={photo.caption}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </Link>

      <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-2xl bg-gradient-to-t from-black/55 to-transparent ${reveal}`} />

      <button
        onClick={() => toggleBookmark(photo)}
        aria-pressed={photo.bookmarkedByMe}
        aria-label={photo.bookmarkedByMe ? 'Remove bookmark' : 'Save to bookmarks'}
        className={`absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-paper/95 text-ink shadow-sm hover:bg-surface ${reveal}`}
      >
        <Bookmark size={17} className={photo.bookmarkedByMe ? 'fill-ink' : ''} />
      </button>

      <div className={`absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-2 ${reveal}`}>
        <Link
          to={`/u/${photo.user.username}`}
          className="flex min-w-0 items-center gap-2 rounded-full bg-black/25 py-1 pl-1 pr-3 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/40"
        >
          <Avatar user={photo.user} size={22} />
          <span className="truncate">{photo.user.username}</span>
        </Link>
        <button
          onClick={() => toggleLike(photo)}
          aria-pressed={photo.likedByMe}
          aria-label={photo.likedByMe ? 'Unlike' : 'Like'}
          className="flex items-center gap-1.5 rounded-full bg-paper/95 px-3 py-1.5 text-xs font-medium text-ink shadow-sm hover:bg-surface"
        >
          <Heart size={15} className={photo.likedByMe ? 'fill-rose-500 text-rose-500' : ''} />
          {photo.likeCount}
        </button>
      </div>
    </article>
  );
}
