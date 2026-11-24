import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryCategory, GalleryItem } from '../types/domain';

const CATEGORY_LABELS: Record<'all' | GalleryCategory, string> = {
  all: 'All Photos',
  pharmacy_signboard: 'Signboard',
  doctor_board: 'Doctor Board',
  pharmacy_exterior: 'Exterior',
  good_hope_logo: 'Logo',
  healthcare_environment: 'Environment',
};

interface GalleryGridProps {
  items: GalleryItem[];
  showFilters?: boolean;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ items, showFilters = true }) => {
  const [filter, setFilter] = useState<'all' | GalleryCategory>('all');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const visibleItems =
    filter === 'all' ? items : items.filter((item) => item.category === filter);

  const availableCategories = Array.from(new Set(items.map((i) => i.category)));

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') {
        setLightboxIdx((prev) => (prev === null ? null : (prev + 1) % visibleItems.length));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIdx((prev) =>
          prev === null ? null : (prev - 1 + visibleItems.length) % visibleItems.length
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, visibleItems.length]);

  if (items.length === 0) {
    return (
      <div className="bg-[#F5F7F8] border border-[#172F43]/10 rounded-2xl p-10 text-center text-sm text-[#172F43]/65">
        No published gallery photographs at this moment.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && availableCategories.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F5F7F8] rounded-xl w-fit border border-[#172F43]/8">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-[#172F43] shadow-sm'
                : 'text-[#172F43]/65 hover:text-[#172F43]'
            }`}
          >
            {CATEGORY_LABELS.all}
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === cat
                  ? 'bg-white text-[#172F43] shadow-sm'
                  : 'text-[#172F43]/65 hover:text-[#172F43]'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleItems.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLightboxIdx(idx)}
            className="group gh-animated-border text-left overflow-hidden flex flex-col cursor-pointer"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#F1F8F3]">
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-xs text-[#37A879] font-medium">
                  {CATEGORY_LABELS[item.category]}
                </div>
                <h3 className="font-display font-bold text-base text-[#172F43] mt-1">
                  {item.title}
                </h3>
                {item.caption && (
                  <p className="text-xs text-[#172F43]/70 mt-1.5 leading-relaxed line-clamp-2">
                    {item.caption}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Interactive Lightbox */}
      {lightboxIdx !== null && visibleItems[lightboxIdx] && (
        <div
          className="fixed inset-0 z-50 bg-[#172F43]/92 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxIdx(null)}
              aria-label="Close lightbox"
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-[#172F43]/80 text-white flex items-center justify-center hover:bg-[#172F43] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative bg-[#0e1e2b] flex items-center justify-center max-h-[72vh]">
              <img
                src={visibleItems[lightboxIdx].imageUrl}
                alt={visibleItems[lightboxIdx].title}
                referrerPolicy="no-referrer"
                className="max-h-[72vh] w-auto object-contain"
              />
              {visibleItems.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() =>
                      setLightboxIdx((lightboxIdx - 1 + visibleItems.length) % visibleItems.length)
                    }
                    className="absolute left-3 w-10 h-10 rounded-full bg-white/90 text-[#172F43] flex items-center justify-center hover:bg-white cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() => setLightboxIdx((lightboxIdx + 1) % visibleItems.length)}
                    className="absolute right-3 w-10 h-10 rounded-full bg-white/90 text-[#172F43] flex items-center justify-center hover:bg-white cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-display font-bold text-base text-[#172F43]">
                  {visibleItems[lightboxIdx].title}
                </h4>
                {visibleItems[lightboxIdx].caption && (
                  <p className="text-sm text-[#172F43]/75 mt-0.5">
                    {visibleItems[lightboxIdx].caption}
                  </p>
                )}
              </div>
              <div className="text-xs font-mono-tabular text-[#172F43]/55 whitespace-nowrap">
                {lightboxIdx + 1} / {visibleItems.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
