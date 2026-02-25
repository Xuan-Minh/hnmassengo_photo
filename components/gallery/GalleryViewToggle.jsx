// components/gallery/GalleryViewToggle.jsx
import { GridIcon, ListIcon } from '../ui/Icons';

export default function GalleryViewToggle({ view, onViewChange }) {
  return (
    <div className="hidden lg:flex gap-4 mb-1 flex-shrink-0">
      <button
        className="group relative w-6 h-6"
        onPointerDown={e => {
          e.preventDefault();
          e.stopPropagation();
          onViewChange('grid');
        }}
        aria-label="Grid view"
      >
        {/* Grille Inactive (Grise) */}
        <GridIcon
          color="#787878"
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ease-in-out ${
            view === 'grid' ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
          }`}
        />
        {/* Grille Active / Survolée (Noire) */}
        <GridIcon
          color="#222222"
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ease-in-out ${
            view === 'grid'
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          }`}
        />
      </button>

      <button
        className="group relative w-6 h-6"
        onPointerDown={e => {
          e.preventDefault();
          e.stopPropagation();
          onViewChange('list');
        }}
        aria-label="List view"
      >
        {/* Liste Inactive (Grise) */}
        <ListIcon
          color="#787878"
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ease-in-out ${
            view === 'list' ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
          }`}
        />
        {/* Liste Active / Survolée (Noire) */}
        <ListIcon
          color="#222222"
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ease-in-out ${
            view === 'list'
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          }`}
        />
      </button>
    </div>
  );
}
