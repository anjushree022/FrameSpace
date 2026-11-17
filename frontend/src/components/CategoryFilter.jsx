import { CATEGORIES } from '../utils/constants';

export default function CategoryFilter({ value, onChange }) {
  const items = ['All', ...CATEGORIES];
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by category">
      <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {items.map((c) => {
          const active = (c === 'All' && !value) || c === value;
          return (
            <button
              key={c}
              onClick={() => onChange(c === 'All' ? '' : c)}
              aria-pressed={active}
              className={`chip ${active ? 'chip-active' : ''}`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
