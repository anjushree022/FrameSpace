import PhotoCard from './PhotoCard';

export default function MasonryGrid({ photos, onUpdate, className = '' }) {
  return (
    <div className={`columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 xl:columns-5 ${className}`}>
      {photos.map((p) => (
        <PhotoCard key={p._id} photo={p} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
