import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pause,
  Play,
  X,
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import type { GalleryCategory, GalleryPhoto } from '../types/cms';
import { ResilientImage } from './ResilientImage';

const CATEGORY_TABS: { id: 'all' | GalleryCategory; label: string }[] = [
  { id: 'all', label: 'Semua Momen' },
  { id: 'campus', label: 'Kampus' },
  { id: 'academics', label: 'Akademik' },
  { id: 'student-life', label: 'Kemahasiswaan' },
  { id: 'events', label: 'Kegiatan' },
];

function formatGalleryCategory(category: GalleryCategory): string {
  switch (category) {
    case 'campus':
      return 'Arsitektur Kampus';
    case 'academics':
      return 'Kegiatan Akademik';
    case 'student-life':
      return 'Kehidupan Mahasiswa';
    case 'events':
      return 'Agenda & Acara';
  }
}

export const CampusGalleryCarousel: React.FC = () => {
  const { galleryPhotos, trackInteraction } = useCampus();

  const [categoryFilter, setCategoryFilter] = useState<'all' | GalleryCategory>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const visiblePhotos = useMemo(() => {
    const active = galleryPhotos
      .filter((p) => p.active)
      .sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title));
    if (categoryFilter === 'all') return active;
    return active.filter((p) => p.category === categoryFilter);
  }, [galleryPhotos, categoryFilter]);

  const safeIndex = visiblePhotos.length > 0 ? Math.min(activeIndex, visiblePhotos.length - 1) : 0;
  const activePhoto: GalleryPhoto | undefined = visiblePhotos[safeIndex];

  const handleNext = useCallback(() => {
    if (visiblePhotos.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % visiblePhotos.length);
  }, [visiblePhotos.length]);

  const handlePrev = useCallback(() => {
    if (visiblePhotos.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + visiblePhotos.length) % visiblePhotos.length);
  }, [visiblePhotos.length]);

  useEffect(() => {
    if (!isAutoPlaying || isHovered || lightboxOpen || visiblePhotos.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % visiblePhotos.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, isHovered, lightboxOpen, visiblePhotos.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, handleNext, handlePrev]);

  const handleCategoryChange = (cat: 'all' | GalleryCategory) => {
    setCategoryFilter(cat);
    setActiveIndex(0);
  };

  const handleOpenLightbox = () => {
    if (!activePhoto) return;
    trackInteraction('page_view', `Galeri Kampus: ${activePhoto.title}`);
    setLightboxOpen(true);
  };

  const slideCounter =
    visiblePhotos.length > 0
      ? `${String(safeIndex + 1).padStart(2, '0')} / ${String(visiblePhotos.length).padStart(2, '0')}`
      : '00 / 00';

  return (
    <div className="space-y-6">
      {/* Section Header + Functional Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-[#0E5A36] mb-2">
            04. Galeri Kehidupan Kampus
          </p>
          <h2 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#0F1F18] leading-tight">
            Potret Keseharian Akademik, Kebersamaan &amp; Lingkungan Kampus
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Filter galeri kehidupan kampus berdasarkan kategori"
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-[#D4DDD6] rounded-lg self-start md:self-auto"
        >
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={categoryFilter === tab.id}
              onClick={() => handleCategoryChange(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-[#0E5A36] text-white'
                  : 'text-[#4A5D54] hover:text-[#0F1F18]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {visiblePhotos.length === 0 || !activePhoto ? (
        <div className="bg-white border border-[#E2E8E2] rounded-xl p-12 text-center">
          <p className="text-sm text-[#4A5D54]">
            Belum ada dokumentasi foto kampus yang dipublikasikan untuk kategori ini.
          </p>
        </div>
      ) : (
        <div
          className="bg-white border border-[#E2E8E2] rounded-xl overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
          }}
          tabIndex={0}
          aria-roledescription="carousel"
          aria-label="Galeri Foto Kehidupan Kampus"
        >
          {/* Dominant 16:9 Stage */}
          <div className="relative aspect-[16/9] max-h-[540px] w-full bg-[#092919] overflow-hidden">
            <ResilientImage
              key={activePhoto.id}
              src={activePhoto.imageUrl}
              alt={activePhoto.title}
              className="w-full h-full object-cover object-center transition-opacity duration-300"
              fallbackTitle={activePhoto.title}
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#071F13]/75 via-[#071F13]/25 to-transparent" />

            {visiblePhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Foto kampus sebelumnya"
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-[#071F13]/75 hover:bg-[#0E5A36] text-white border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Foto kampus berikutnya"
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-[#071F13]/75 hover:bg-[#0E5A36] text-white border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
              {visiblePhotos.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsAutoPlaying((v) => !v)}
                  aria-label={isAutoPlaying ? 'Jeda tayangan otomatis' : 'Putar tayangan otomatis'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#071F13]/75 hover:bg-[#0E5A36] border border-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  {isAutoPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Jeda</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Putar</span>
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenLightbox}
                aria-label="Buka foto dalam layar penuh"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#071F13]/75 hover:bg-[#0E5A36] border border-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Perbesar</span>
              </button>
            </div>

            <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 font-mono text-xs font-medium text-white/95 tabular-nums tracking-wider">
              {slideCounter}
            </div>
          </div>

          {/* Editorial Caption & Metadata Bar */}
          <div className="px-5 sm:px-7 py-5 border-b border-[#E2E8E2] flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="text-xs text-[#4A5D54] mb-1">
                <span className="font-semibold text-[#0E5A36]">
                  {formatGalleryCategory(activePhoto.category)}
                </span>
                <span aria-hidden="true"> · </span>
                <span>Dokumentasi oleh {activePhoto.photographer}</span>
              </div>
              <h3 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F1F18] leading-snug">
                {activePhoto.title}
              </h3>
              <p className="text-sm text-[#4A5D54] leading-relaxed mt-1.5">
                {activePhoto.caption}
              </p>
            </div>

            {visiblePhotos.length > 1 && (
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3 py-1.5 text-xs font-medium text-[#0F1F18] border border-[#D4DDD6] hover:bg-[#F2F5F1] rounded-lg transition-colors cursor-pointer"
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg transition-colors cursor-pointer"
                >
                  Slide Berikutnya
                </button>
              </div>
            )}
          </div>

          {/* Interactive Thumbnail Filmstrip */}
          {visiblePhotos.length > 1 && (
            <div className="px-5 sm:px-7 py-4 bg-[#FAFBF9]">
              <div
                className="flex items-center gap-3 overflow-x-auto pb-1"
                role="listbox"
                aria-label="Pilih foto kampus"
              >
                {visiblePhotos.map((photo, idx) => {
                  const selected = idx === safeIndex;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => setActiveIndex(idx)}
                      className={`group relative shrink-0 w-28 sm:w-36 text-left rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        selected
                          ? 'border-[#0E5A36] ring-1 ring-[#0E5A36]'
                          : 'border-transparent opacity-75 hover:opacity-100 hover:border-[#D4DDD6]'
                      }`}
                    >
                      <div className="aspect-[16/10] w-full bg-[#E8EFEA] overflow-hidden">
                        <ResilientImage
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                          fallbackTitle={photo.title}
                        />
                      </div>
                      <div className="px-2 py-1.5 bg-white">
                        <div className="text-[11px] font-medium text-[#0F1F18] truncate">
                          {photo.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && activePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#071F13]/92"
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
        >
          <div
            className="fixed inset-0"
            onClick={() => setLightboxOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-5xl w-full bg-[#0B291A] border border-white/15 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 border-b border-white/12 flex items-center justify-between gap-4">
              <div className="text-xs text-white/80 truncate">
                <span className="font-mono tabular-nums text-[#E5C158] font-semibold">
                  {slideCounter}
                </span>
                <span aria-hidden="true"> · </span>
                <span>{formatGalleryCategory(activePhoto.category)}</span>
                <span aria-hidden="true"> · </span>
                <span>{activePhoto.photographer}</span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                aria-label="Tutup tampilan layar penuh"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[16/9] max-h-[70vh] w-full bg-black/50 flex items-center justify-center">
              <ResilientImage
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="w-full h-full object-contain"
                fallbackTitle={activePhoto.title}
              />

              {visiblePhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Foto sebelumnya"
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-black/60 hover:bg-[#0E5A36] text-white border border-white/20 flex items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Foto berikutnya"
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-black/60 hover:bg-[#0E5A36] text-white border border-white/20 flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="px-6 py-4 bg-[#092216]">
              <h3 className="font-editorial text-lg sm:text-xl font-semibold text-white">
                {activePhoto.title}
              </h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed mt-1">
                {activePhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
