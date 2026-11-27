import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Calendar, GraduationCap, MessageSquareQuote, Newspaper, Search, X } from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import type { AcademicProgram, AgendaEvent, Post } from '../types/cms';

interface SiteSearchModalProps {
  isOpen: boolean;
  initialQuery?: string;
  onClose: () => void;
  onSelectProgram: (program: AcademicProgram) => void;
  onSelectPost: (post: Post) => void;
  onSelectAgenda: (evt: AgendaEvent) => void;
  onJumpToSection: (sectionId: string) => void;
}

type SearchScope = 'all' | 'programs' | 'posts' | 'agenda' | 'alumni';

export const SiteSearchModal: React.FC<SiteSearchModalProps> = ({
  isOpen,
  initialQuery = '',
  onClose,
  onSelectProgram,
  onSelectPost,
  onSelectAgenda,
  onJumpToSection,
}) => {
  const { programs, posts, agenda, testimonials, trackInteraction } = useCampus();
  const [queryText, setQueryText] = useState(initialQuery);
  const [scope, setScope] = useState<SearchScope>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQueryText(initialQuery);
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const normalized = queryText.trim().toLowerCase();

  useEffect(() => {
    if (!isOpen || normalized.length < 3) return;
    const timer = window.setTimeout(() => {
      trackInteraction('search', normalized);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [isOpen, normalized, trackInteraction]);

  const publishedPosts = useMemo(
    () => posts.filter((p) => p.status === 'published'),
    [posts],
  );
  const activePrograms = useMemo(
    () => programs.filter((p) => p.active),
    [programs],
  );
  const activeAgenda = useMemo(
    () => agenda.filter((a) => a.active),
    [agenda],
  );
  const activeTestimonials = useMemo(
    () => testimonials.filter((t) => t.active),
    [testimonials],
  );

  const matchedPrograms = useMemo(() => {
    if (scope !== 'all' && scope !== 'programs') return [];
    if (!normalized) return activePrograms.slice(0, 3);
    return activePrograms.filter(
      (p) =>
        p.name.toLowerCase().includes(normalized) ||
        p.code.toLowerCase().includes(normalized) ||
        p.faculty.toLowerCase().includes(normalized) ||
        p.summary.toLowerCase().includes(normalized),
    );
  }, [activePrograms, normalized, scope]);

  const matchedPosts = useMemo(() => {
    if (scope !== 'all' && scope !== 'posts') return [];
    if (!normalized) return publishedPosts.slice(0, 4);
    return publishedPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(normalized) ||
        p.excerpt.toLowerCase().includes(normalized) ||
        p.category.toLowerCase().includes(normalized) ||
        p.content.toLowerCase().includes(normalized),
    );
  }, [publishedPosts, normalized, scope]);

  const matchedAgenda = useMemo(() => {
    if (scope !== 'all' && scope !== 'agenda') return [];
    if (!normalized) return activeAgenda.slice(0, 3);
    return activeAgenda.filter(
      (a) =>
        a.title.toLowerCase().includes(normalized) ||
        a.location.toLowerCase().includes(normalized) ||
        a.description.toLowerCase().includes(normalized),
    );
  }, [activeAgenda, normalized, scope]);

  const matchedAlumni = useMemo(() => {
    if (scope !== 'all' && scope !== 'alumni') return [];
    if (!normalized) return activeTestimonials.slice(0, 2);
    return activeTestimonials.filter(
      (t) =>
        t.name.toLowerCase().includes(normalized) ||
        t.program.toLowerCase().includes(normalized) ||
        t.organization.toLowerCase().includes(normalized) ||
        t.quote.toLowerCase().includes(normalized),
    );
  }, [activeTestimonials, normalized, scope]);

  const totalMatches =
    matchedPrograms.length +
    matchedPosts.length +
    matchedAgenda.length +
    matchedAlumni.length;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 pt-12 sm:pt-20"
      role="dialog"
      aria-modal="true"
      aria-label="Search University Portal"
    >
      <div
        className="fixed inset-0 bg-[#0F1F18]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-2xl bg-white border border-[#D4DDD6] rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input Row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E2E8E2]">
          <Search className="w-5 h-5 text-[#0E5A36] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search programs (PAI, PGMI, HKI), news, announcements, agenda, or alumni..."
            className="flex-1 text-sm sm:text-base text-[#0F1F18] placeholder:text-[#76877E] focus:outline-none"
          />
          {queryText && (
            <button
              type="button"
              onClick={() => setQueryText('')}
              className="text-xs font-medium text-[#4A5D54] hover:text-[#0F1F18] cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1.5 text-[#4A5D54] hover:text-[#0F1F18] hover:bg-[#F2F5F1] rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scope Filter Bar */}
        <div className="px-5 py-2.5 bg-[#FAFBF9] border-b border-[#E2E8E2] flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-1">
            {(
              [
                ['all', 'All Content'],
                ['programs', 'Programs'],
                ['posts', 'News & Notices'],
                ['agenda', 'Agenda'],
                ['alumni', 'Alumni'],
              ] as [SearchScope, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setScope(key)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  scope === key
                    ? 'bg-[#0E5A36] text-white'
                    : 'text-[#4A5D54] hover:text-[#0F1F18] hover:bg-[#E9EFEA]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs text-[#6B7D74] font-mono tabular-nums whitespace-nowrap shrink-0">
            {totalMatches} result{totalMatches === 1 ? '' : 's'}
          </span>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#EDF1EE]">
          {totalMatches === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-[#0F1F18]">
                No matches for &ldquo;{queryText}&rdquo;
              </p>
              <p className="text-xs text-[#4A5D54] mt-1">
                Try searching for PAI, Syariah, Tahfidz, KKN, Admissions, or Makassar.
              </p>
            </div>
          ) : (
            <>
              {matchedPrograms.length > 0 && (
                <div className="p-4">
                  <div className="text-xs font-semibold text-[#4A5D54] px-2 mb-2">
                    Academic Programs
                  </div>
                  <div className="space-y-1">
                    {matchedPrograms.map((prog) => (
                      <button
                        key={prog.id}
                        type="button"
                        onClick={() => {
                          onSelectProgram(prog);
                          onClose();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F2F5F1] flex items-center justify-between gap-3 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <GraduationCap className="w-4 h-4 text-[#0E5A36] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#0F1F18] truncate">
                              {prog.name}
                            </div>
                            <div className="text-xs text-[#4A5D54] truncate">
                              {prog.degree} · {prog.faculty} · Accreditation {prog.accreditation}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#899B90] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedPosts.length > 0 && (
                <div className="p-4">
                  <div className="text-xs font-semibold text-[#4A5D54] px-2 mb-2">
                    News, Articles &amp; Announcements
                  </div>
                  <div className="space-y-1">
                    {matchedPosts.map((post) => (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => {
                          onSelectPost(post);
                          onClose();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F2F5F1] flex items-center justify-between gap-3 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <Newspaper className="w-4 h-4 text-[#0E5A36] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#0F1F18] truncate">
                              {post.title}
                            </div>
                            <div className="text-xs text-[#4A5D54] truncate">
                              {post.category.charAt(0).toUpperCase() + post.category.slice(1)} ·{' '}
                              {post.publishedDate} · {post.authorName}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#899B90] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedAgenda.length > 0 && (
                <div className="p-4">
                  <div className="text-xs font-semibold text-[#4A5D54] px-2 mb-2">
                    Campus Agenda
                  </div>
                  <div className="space-y-1">
                    {matchedAgenda.map((evt) => (
                      <button
                        key={evt.id}
                        type="button"
                        onClick={() => {
                          onSelectAgenda(evt);
                          onClose();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F2F5F1] flex items-center justify-between gap-3 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <Calendar className="w-4 h-4 text-[#0E5A36] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#0F1F18] truncate">
                              {evt.title}
                            </div>
                            <div className="text-xs text-[#4A5D54] truncate">
                              {evt.eventDate} · {evt.timeRange} · {evt.location}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#899B90] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedAlumni.length > 0 && (
                <div className="p-4">
                  <div className="text-xs font-semibold text-[#4A5D54] px-2 mb-2">
                    Alumni Stories
                  </div>
                  <div className="space-y-1">
                    {matchedAlumni.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onJumpToSection('alumni');
                          onClose();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F2F5F1] flex items-center justify-between gap-3 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <MessageSquareQuote className="w-4 h-4 text-[#0E5A36] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#0F1F18] truncate">
                              {item.name} — {item.role}
                            </div>
                            <div className="text-xs text-[#4A5D54] truncate">
                              Class of {item.graduationYear} · {item.program} · {item.organization}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#899B90] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
