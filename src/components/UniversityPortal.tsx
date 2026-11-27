import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import { UNIVERSITY_MEDIA } from '../data/defaultCampusData';
import type { AcademicProgram, AgendaEvent, Post, PostCategory } from '../types/cms';
import { CampusGalleryCarousel } from './CampusGalleryCarousel';
import { InteractiveCampusMap } from './InteractiveCampusMap';
import { ResilientImage } from './ResilientImage';
import { SocialMediaFooter } from './SocialMediaFooter';

interface UniversityPortalProps {
  onOpenAdmin: () => void;
  onOpenSearch: (initialQuery?: string) => void;
  onOpenNotifications: () => void;
  selectedProgram: AcademicProgram | null;
  onSelectProgram: (program: AcademicProgram | null) => void;
  selectedPost: Post | null;
  onSelectPost: (post: Post | null) => void;
  selectedAgenda: AgendaEvent | null;
  onSelectAgenda: (evt: AgendaEvent | null) => void;
}

function formatReadableDate(iso: string): string {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseMonthDay(iso: string): { month: string; day: string } {
  const parts = iso.split('-');
  if (parts.length !== 3) return { month: 'DATE', day: '--' };
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(date.getTime())) return { month: 'DATE', day: '--' };
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    day: String(date.getDate()).padStart(2, '0'),
  };
}

function categoryLabel(cat: PostCategory): string {
  if (cat === 'announcement') return 'Announcement';
  if (cat === 'article') return 'Scholarly Article';
  return 'Campus News';
}

export const UniversityPortal: React.FC<UniversityPortalProps> = ({
  onOpenAdmin,
  onOpenSearch,
  onOpenNotifications,
  selectedProgram,
  onSelectProgram,
  selectedPost,
  onSelectPost,
  selectedAgenda,
  onSelectAgenda,
}) => {
  const {
    siteSettings,
    programs,
    posts,
    agenda,
    testimonials,
    unreadNotificationCount,
    isAdmin,
    trackInteraction,
    incrementPostView,
  } = useCampus();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroSearchInput, setHeroSearchInput] = useState('');
  const [degreeFilter, setDegreeFilter] = useState<'ALL' | 'S2' | 'S1'>('ALL');
  const [postFilter, setPostFilter] = useState<'all' | PostCategory>('all');
  const [admissionsInquiryOpen, setAdmissionsInquiryOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    programCode: 'S1-PAI',
  });
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const visiblePrograms = useMemo(() => {
    const active = programs.filter((p) => p.active);
    if (degreeFilter === 'ALL') return active;
    return active.filter((p) => p.degree === degreeFilter);
  }, [programs, degreeFilter]);

  const publishedPosts = useMemo(
    () => posts.filter((p) => p.status === 'published'),
    [posts],
  );

  const filteredPosts = useMemo(() => {
    if (postFilter === 'all') return publishedPosts;
    return publishedPosts.filter((p) => p.category === postFilter);
  }, [publishedPosts, postFilter]);

  const urgentAnnouncements = useMemo(
    () =>
      publishedPosts.filter(
        (p) => p.category === 'announcement' && (p.priority === 'urgent' || p.priority === 'important'),
      ),
    [publishedPosts],
  );

  const visibleAgenda = useMemo(
    () => agenda.filter((a) => a.active),
    [agenda],
  );

  const visibleTestimonials = useMemo(
    () => testimonials.filter((t) => t.active),
    [testimonials],
  );

  const handleOpenPost = (post: Post) => {
    incrementPostView(post);
    onSelectPost(post);
  };

  const handleOpenProgram = (program: AcademicProgram) => {
    trackInteraction('program_view', `${program.code} ${program.name}`);
    onSelectProgram(program);
  };

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenSearch(heroSearchInput);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.fullName.trim() || !inquiryForm.email.includes('@')) return;
    trackInteraction('program_view', `Admissions Inquiry: ${inquiryForm.programCode}`);
    setInquirySubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#0F1F18]">
      {/* Strictly 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E2E8E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand */}
          <a
            href="#top"
            className="flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5A36] rounded-md"
          >
            <img
              src={UNIVERSITY_MEDIA.logo}
              alt="STAI Al-Furqan Makassar Crest"
              className="w-9 h-9 rounded-full object-cover border border-[#E2E8E2] shrink-0"
            />
            <span className="font-editorial text-base sm:text-lg font-semibold tracking-tight text-[#0F1F18] whitespace-nowrap">
              {siteSettings.institutionName}
            </span>
          </a>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#4A5D54]"
          >
            <a
              href="#profile"
              className="hover:text-[#0E5A36] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Profile
            </a>
            <a
              href="#programs"
              className="hover:text-[#0E5A36] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Programs
            </a>
            <a
              href="#news"
              className="hover:text-[#0E5A36] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              News &amp; Notices
            </a>
            <a
              href="#alumni"
              className="hover:text-[#0E5A36] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Alumni
            </a>
            <a
              href="#campus-map"
              className="hover:text-[#0E5A36] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Campus Map
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action (+ mobile menu toggle on small screens) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isAdmin ? 'CMS Dashboard' : 'Admin Portal'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2.5 text-[#0F1F18] hover:bg-[#F2F5F1] rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E2E8E2] px-4 py-4 space-y-1">
            {[
              ['#profile', 'Institutional Profile'],
              ['#programs', 'Academic Programs'],
              ['#news', 'News, Articles & Notices'],
              ['#agenda', 'Campus Agenda'],
              ['#gallery', 'Campus Life Gallery'],
              ['#alumni', 'Alumni Testimonials'],
              ['#campus-map', 'Interactive Campus Map'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-[#0F1F18] hover:bg-[#F2F5F1] rounded-lg"
              >
                {label}
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-[#E2E8E2] flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch('');
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-[#0F1F18] border border-[#D4DDD6] rounded-lg cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#0E5A36]" />
                Search Site
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenNotifications();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-[#0F1F18] border border-[#D4DDD6] rounded-lg cursor-pointer"
              >
                <Bell className="w-4 h-4 text-[#0E5A36]" />
                Alerts ({unreadNotificationCount})
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        {/* Hero Focal Section */}
        <section className="relative bg-[#092919] text-white overflow-hidden">
          <div className="absolute inset-0">
            <ResilientImage
              src={UNIVERSITY_MEDIA.heroCourtyard}
              alt="STAI Al-Furqan Makassar campus courtyard and mosque dome"
              className="w-full h-full object-cover object-center opacity-55"
              fallbackTitle="STAI Al-Furqan Makassar"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#071F13]/92 via-[#092919]/75 to-[#092919]/40" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-22 lg:py-26">
            <div className="max-w-3xl">
              <p className="text-xs sm:text-sm font-medium text-[#E5C158] tracking-wide mb-4">
                {siteSettings.admissionsOpen
                  ? `${siteSettings.admissionsLabel} · Makassar, South Sulawesi`
                  : 'Sekolah Tinggi Agama Islam Al-Furqan · Makassar, South Sulawesi'}
              </p>

              <h1 className="font-editorial text-3xl sm:text-5xl lg:text-[52px] font-semibold leading-[1.12] tracking-tight text-white mb-5">
                {siteSettings.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl mb-8">
                {siteSettings.heroSubtitle}
              </p>

              {/* Primary CTA + Integrated Search & Live Alerts Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-7">
                <a
                  href="#programs"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#082416] bg-[#E5C158] hover:bg-[#d7b245] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Explore Academic Programs
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setInquirySubmitted(false);
                    setAdmissionsInquiryOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white border border-white/30 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Admissions Information
                </button>
              </div>

              {/* Integrated Portal Search & Real-time Notification Trigger */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
                <form
                  onSubmit={handleHeroSearchSubmit}
                  className="flex-1 flex items-center bg-white rounded-lg p-1.5 shadow-sm"
                >
                  <Search className="w-4 h-4 text-[#4A5D54] ml-2.5 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={heroSearchInput}
                    onChange={(e) => setHeroSearchInput(e.target.value)}
                    placeholder="Search study programs, articles, agenda, announcements..."
                    className="flex-1 text-sm text-[#0F1F18] placeholder:text-[#6B7D74] bg-transparent focus:outline-none py-1.5"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#0E5A36]/90 hover:bg-[#0E5A36] border border-white/20 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-[#E5C158]" />
                  <span>Campus Alerts</span>
                  {unreadNotificationCount > 0 && (
                    <span className="font-mono tabular-nums text-[#E5C158] font-semibold">
                      ({unreadNotificationCount})
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Full-Width 4-Column Quantitative Proof Strip */}
        <section aria-label="Institutional Highlights" className="bg-white border-b border-[#E2E8E2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div>
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-[#0E5A36] tabular-nums">
                {programs.filter((p) => p.active).length}
              </div>
              <div className="text-sm font-medium text-[#0F1F18] mt-1">
                Accredited Degree Programs
              </div>
              <div className="text-xs text-[#4A5D54] mt-0.5">S1 Undergraduate &amp; S2 Postgraduate</div>
            </div>
            <div>
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-[#0E5A36] tabular-nums">
                30+ Years
              </div>
              <div className="text-sm font-medium text-[#0F1F18] mt-1">
                Academic Heritage
              </div>
              <div className="text-xs text-[#4A5D54] mt-0.5">Serving Makassar &amp; Eastern Indonesia</div>
            </div>
            <div>
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-[#0E5A36] tabular-nums">
                94%
              </div>
              <div className="text-sm font-medium text-[#0F1F18] mt-1">
                Graduate Placement Rate
              </div>
              <div className="text-xs text-[#4A5D54] mt-0.5">Within 6 months of commencement</div>
            </div>
            <div>
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-[#0E5A36] tabular-nums">
                30 Juz
              </div>
              <div className="text-sm font-medium text-[#0F1F18] mt-1">
                Tahfidz &amp; Tilawah Track
              </div>
              <div className="text-xs text-[#4A5D54] mt-0.5">Integrated scholarship pathway</div>
            </div>
          </div>
        </section>

        {/* Institutional Profile: Vision, Mission & Leadership */}
        <section id="profile" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-5 rounded-xl overflow-hidden border border-[#E2E8E2] bg-white min-h-[300px]">
              <ResilientImage
                src={UNIVERSITY_MEDIA.libraryHall}
                alt="STAI Al-Furqan Makassar Academic Library and Study Hall"
                className="w-full h-full object-cover"
                fallbackTitle="Academic Library & Scholarship Hall"
              />
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <p className="text-xs font-semibold text-[#0E5A36] mb-2">
                  01. Institutional Profile
                </p>
                <h2 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#0F1F18] leading-tight mb-4">
                  Grounded in Tafaqquh Fid-Din, Built for Contemporary Service
                </h2>
                <p className="text-base text-[#4A5D54] leading-relaxed">
                  {siteSettings.rectorMessage}
                </p>
                <div className="text-xs text-[#4A5D54] mt-3">
                  <span className="font-semibold text-[#0F1F18]">{siteSettings.rectorName}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{siteSettings.rectorTitle}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#E2E8E2]">
                <div>
                  <h3 className="text-base font-semibold text-[#0F1F18] mb-2">
                    Institutional Vision
                  </h3>
                  <p className="text-sm text-[#4A5D54] leading-relaxed">{siteSettings.vision}</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F1F18] mb-2">
                    Core Academic Mission
                  </h3>
                  <p className="text-sm text-[#4A5D54] leading-relaxed">{siteSettings.mission}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Academic Programs Directory */}
        <section
          id="programs"
          className="bg-[#F2F5F1] border-y border-[#E2E8E2] py-16 sm:py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold text-[#0E5A36] mb-2">
                  02. Academic Offerings
                </p>
                <h2 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#0F1F18] leading-tight">
                  Accredited Undergraduate &amp; Postgraduate Programs
                </h2>
              </div>

              {/* Functional Segmented Filter Controls */}
              <div
                role="tablist"
                aria-label="Filter academic programs by degree level"
                className="inline-flex items-center gap-1 p-1 bg-white border border-[#D4DDD6] rounded-lg self-start md:self-auto"
              >
                {(
                  [
                    ['ALL', 'All Programs'],
                    ['S2', 'Postgraduate (S2)'],
                    ['S1', 'Undergraduate (S1)'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={degreeFilter === key}
                    onClick={() => setDegreeFilter(key)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      degreeFilter === key
                        ? 'bg-[#0E5A36] text-white'
                        : 'text-[#4A5D54] hover:text-[#0F1F18]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {visiblePrograms.length === 0 ? (
              <div className="bg-white border border-[#E2E8E2] rounded-xl p-10 text-center">
                <p className="text-sm text-[#4A5D54]">No active programs match the selected degree filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visiblePrograms.map((program) => (
                  <article
                    key={program.id}
                    className="bg-white border border-[#E2E8E2] rounded-xl p-6 flex flex-col justify-between hover:border-[#0E5A36]/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-[#4A5D54] mb-3">
                        <span className="font-mono font-medium text-[#0E5A36]">
                          {program.code} · {program.degree}
                        </span>
                        <span className="tabular-nums">Accreditation {program.accreditation}</span>
                      </div>

                      <h3 className="font-editorial text-xl font-semibold text-[#0F1F18] leading-snug mb-2">
                        {program.name}
                      </h3>

                      <div className="text-xs text-[#4A5D54] mb-3">
                        <span>{program.faculty}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="tabular-nums">{program.credits} SKS</span>
                        <span aria-hidden="true"> · </span>
                        <span>{program.duration}</span>
                      </div>

                      <p className="text-sm text-[#4A5D54] leading-relaxed mb-5">
                        {program.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#EDF1EE] flex items-center justify-between gap-3">
                      <span className="text-xs text-[#6B7D74] truncate">
                        {program.careerOutcomes.split(',')[0]}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenProgram(program)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E5A36] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Program Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* News, Scholarly Articles, Announcements & Campus Agenda */}
        <section id="news" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-semibold text-[#0E5A36] mb-2">
                03. Campus Publications &amp; Calendar
              </p>
              <h2 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#0F1F18] leading-tight">
                News, Articles, Announcements &amp; Agenda
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                role="tablist"
                aria-label="Filter campus publications"
                className="inline-flex items-center gap-1 p-1 bg-[#F2F5F1] border border-[#E2E8E2] rounded-lg"
              >
                {(
                  [
                    ['all', 'All Updates'],
                    ['news', 'News'],
                    ['article', 'Articles'],
                    ['announcement', 'Announcements'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={postFilter === key}
                    onClick={() => setPostFilter(key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      postFilter === key
                        ? 'bg-white text-[#0F1F18] shadow-xs'
                        : 'text-[#4A5D54] hover:text-[#0F1F18]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onOpenSearch('')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#0F1F18] border border-[#D4DDD6] hover:bg-[#F2F5F1] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-[#0E5A36]" />
                Search Archive
              </button>
            </div>
          </div>

          {/* Priority Announcements Strip (if any) */}
          {urgentAnnouncements.length > 0 && (
            <div className="mb-10 bg-white border border-[#D4DDD6] rounded-xl p-5">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0E5A36]">
                  <ShieldAlert className="w-4 h-4 text-[#C49A2C]" />
                  Official Campus Bulletins
                </div>
                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className="text-xs font-medium text-[#0E5A36] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  View All Alerts
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-[#EDF1EE]">
                {urgentAnnouncements.slice(0, 2).map((notice, idx) => (
                  <div key={notice.id} className={idx > 0 ? 'pt-3 md:pt-0 md:pl-5' : ''}>
                    <div className="text-xs text-[#4A5D54] mb-1">
                      <span className={notice.priority === 'urgent' ? 'font-semibold text-red-700' : 'font-semibold text-amber-800'}>
                        {notice.priority === 'urgent' ? 'Urgent Notice' : 'Important Notice'}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span className="font-mono tabular-nums">{formatReadableDate(notice.publishedDate)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenPost(notice)}
                      className="text-left text-sm font-semibold text-[#0F1F18] hover:text-[#0E5A36] transition-colors cursor-pointer"
                    >
                      {notice.title}
                    </button>
                    <p className="text-xs text-[#4A5D54] mt-1 line-clamp-2">{notice.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Asymmetric Grid: 8-Col Editorial Feed + 4-Col Campus Agenda */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left 8 Columns: News, Articles, Announcements */}
            <div className="lg:col-span-8">
              {filteredPosts.length === 0 ? (
                <div className="bg-white border border-[#E2E8E2] rounded-xl p-10 text-center">
                  <p className="text-sm text-[#4A5D54]">No published posts in this category yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Lead Story */}
                  {(() => {
                    const lead = filteredPosts[0];
                    return (
                      <article className="bg-white border border-[#E2E8E2] rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 hover:border-[#0E5A36]/60 transition-colors">
                        <div className="md:col-span-6 aspect-[4/3] md:aspect-auto md:h-full">
                          <ResilientImage
                            src={lead.coverImage}
                            alt={lead.title}
                            className="w-full h-full object-cover"
                            fallbackTitle={lead.title}
                          />
                        </div>
                        <div className="md:col-span-6 p-6 flex flex-col justify-between">
                          <div>
                            <div className="text-xs text-[#4A5D54] mb-2">
                              <span className="font-semibold text-[#0E5A36]">
                                {categoryLabel(lead.category)}
                              </span>
                              <span aria-hidden="true"> · </span>
                              <span className="tabular-nums">
                                {formatReadableDate(lead.publishedDate)}
                              </span>
                            </div>
                            <h3 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F1F18] leading-snug mb-3">
                              {lead.title}
                            </h3>
                            <p className="text-sm text-[#4A5D54] leading-relaxed mb-4">
                              {lead.excerpt}
                            </p>
                          </div>
                          <div className="pt-4 border-t border-[#EDF1EE] flex items-center justify-between gap-2">
                            <span className="text-xs text-[#6B7D74] truncate">
                              {lead.authorName} · <span className="tabular-nums">{lead.views}</span> views
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenPost(lead)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E5A36] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Read Full Story
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })()}

                  {/* Secondary Grid */}
                  {filteredPosts.length > 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {filteredPosts.slice(1).map((post) => (
                        <article
                          key={post.id}
                          className="bg-white border border-[#E2E8E2] rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#0E5A36]/60 transition-colors"
                        >
                          <div>
                            <div className="aspect-[16/10] w-full overflow-hidden">
                              <ResilientImage
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-full object-cover"
                                fallbackTitle={post.title}
                              />
                            </div>
                            <div className="p-5">
                              <div className="text-xs text-[#4A5D54] mb-2">
                                <span className="font-semibold text-[#0E5A36]">
                                  {categoryLabel(post.category)}
                                </span>
                                <span aria-hidden="true"> · </span>
                                <span className="tabular-nums">
                                  {formatReadableDate(post.publishedDate)}
                                </span>
                              </div>
                              <h3 className="font-editorial text-lg font-semibold text-[#0F1F18] leading-snug mb-2">
                                {post.title}
                              </h3>
                              <p className="text-sm text-[#4A5D54] leading-relaxed line-clamp-3">
                                {post.excerpt}
                              </p>
                            </div>
                          </div>
                          <div className="px-5 py-3.5 border-t border-[#EDF1EE] flex items-center justify-between gap-2">
                            <span className="text-xs text-[#6B7D74] truncate">
                              {post.authorName}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenPost(post)}
                              className="text-xs font-semibold text-[#0E5A36] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Read Article
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right 4 Columns: Campus Agenda */}
            <aside id="agenda" className="lg:col-span-4">
              <div className="bg-white border border-[#E2E8E2] rounded-xl p-6 sticky top-22">
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#E2E8E2] mb-4">
                  <div>
                    <h3 className="font-editorial text-xl font-semibold text-[#0F1F18]">
                      Campus Agenda
                    </h3>
                    <p className="text-xs text-[#4A5D54] mt-0.5">
                      Upcoming academic &amp; student events
                    </p>
                  </div>
                  <Calendar className="w-5 h-5 text-[#0E5A36] shrink-0" />
                </div>

                {visibleAgenda.length === 0 ? (
                  <p className="text-sm text-[#4A5D54] py-6 text-center">
                    No scheduled events available.
                  </p>
                ) : (
                  <div className="divide-y divide-[#EDF1EE]">
                    {visibleAgenda.map((evt) => {
                      const { month, day } = parseMonthDay(evt.eventDate);
                      return (
                        <button
                          key={evt.id}
                          type="button"
                          onClick={() => onSelectAgenda(evt)}
                          className="w-full text-left py-4 first:pt-1 last:pb-1 flex items-start gap-4 group cursor-pointer"
                        >
                          <div className="w-12 shrink-0 text-center py-1.5 bg-[#F2F5F1] border border-[#E2E8E2] rounded-lg">
                            <div className="text-[11px] font-semibold text-[#0E5A36]">
                              {month}
                            </div>
                            <div className="font-mono text-lg font-semibold text-[#0F1F18] tabular-nums leading-tight">
                              {day}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-[#0F1F18] group-hover:text-[#0E5A36] leading-snug transition-colors">
                              {evt.title}
                            </div>
                            <div className="text-xs text-[#4A5D54] mt-1 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 shrink-0 text-[#6B7D74]" />
                              <span className="truncate">{evt.timeRange}</span>
                            </div>
                            <div className="text-xs text-[#6B7D74] mt-0.5 truncate">
                              {evt.location}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>

        {/* Campus Life Photo Gallery Carousel */}
        <section
          id="gallery"
          className="bg-[#F2F5F1] border-t border-[#E2E8E2] py-16 sm:py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CampusGalleryCarousel />
          </div>
        </section>

        {/* Alumni Testimonials Section */}
        <section
          id="alumni"
          className="bg-[#092919] text-white py-16 sm:py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-semibold text-[#E5C158] mb-2">
                05. Alumni Outcomes
              </p>
              <h2 className="font-editorial text-2xl sm:text-4xl font-semibold text-white leading-tight mb-3">
                Graduates Serving Schools, Courts &amp; Communities
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                Verified perspectives from STAI Al-Furqan Makassar alumni advancing Islamic
                education, family mediation, and community guidance across South Sulawesi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleTestimonials.map((item) => (
                <figure
                  key={item.id}
                  className="bg-[#0E3622] border border-white/15 rounded-xl p-6 sm:p-7 flex flex-col justify-between"
                >
                  <blockquote className="text-sm sm:text-base text-white/92 leading-relaxed mb-6">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="pt-4 border-t border-white/12 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="text-xs text-white/75 mt-0.5">
                        {item.role} · {item.organization}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-medium text-[#E5C158]">{item.program}</div>
                      <div className="text-xs font-mono text-white/65 tabular-nums">
                        Class of {item.graduationYear}
                      </div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Campus Map Section */}
        <section id="campus-map" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-semibold text-[#0E5A36] mb-2">
              06. Visit Daya Campus
            </p>
            <h2 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#0F1F18] leading-tight mb-3">
              Interactive Campus Map &amp; Makassar Access
            </h2>
            <p className="text-sm sm:text-base text-[#4A5D54] leading-relaxed">
              Explore campus buildings along Jl. Perintis Kemerdekaan KM. 15, Daya, Makassar, or
              search nearby transit hubs and landmarks using live Google Maps data.
            </p>
          </div>

          <InteractiveCampusMap />
        </section>
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="bg-white border-t border-[#E2E8E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={UNIVERSITY_MEDIA.logo}
                alt="STAI Al-Furqan Makassar Crest"
                className="w-9 h-9 rounded-full object-cover border border-[#E2E8E2]"
              />
              <span className="font-editorial text-lg font-semibold text-[#0F1F18]">
                {siteSettings.institutionName}
              </span>
            </div>
            <p className="text-sm text-[#4A5D54] leading-relaxed max-w-md mb-4">
              {siteSettings.address}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#4A5D54]">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0E5A36]" />
                {siteSettings.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#0E5A36]" />
                {siteSettings.email}
              </span>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold text-[#0F1F18] mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-sm text-[#4A5D54]">
              <li><a href="#profile" className="hover:text-[#0E5A36]">Institutional Profile</a></li>
              <li><a href="#programs" className="hover:text-[#0E5A36]">Academic Programs</a></li>
              <li><a href="#news" className="hover:text-[#0E5A36]">News &amp; Announcements</a></li>
              <li><a href="#gallery" className="hover:text-[#0E5A36]">Campus Life Gallery</a></li>
              <li><a href="#alumni" className="hover:text-[#0E5A36]">Alumni Testimonials</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-xs font-semibold text-[#0F1F18] mb-3">Portal Services</h4>
            <div className="space-y-2.5 text-sm text-[#4A5D54]">
              <button
                type="button"
                onClick={() => onOpenSearch('')}
                className="block hover:text-[#0E5A36] cursor-pointer"
              >
                Integrated Site Search
              </button>
              <button
                type="button"
                onClick={onOpenNotifications}
                className="block hover:text-[#0E5A36] cursor-pointer"
              >
                Real-Time Campus Notifications
              </button>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="block hover:text-[#0E5A36] cursor-pointer"
              >
                Administrative CMS &amp; Analytics
              </button>
            </div>
            <p className="text-[11px] text-[#6B7D74] mt-5 leading-relaxed">
              Interactive campus mapping uses Google Maps Platform features and is subject to the{' '}
              <a
                href="https://maps.google.com/help/terms_maps/?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#0E5A36]"
              >
                Google Maps End User Terms
              </a>{' '}
              and{' '}
              <a
                href="https://policies.google.com/privacy?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#0E5A36]"
              >
                Google Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
        <SocialMediaFooter
          institutionName={siteSettings.institutionName}
          links={{
            instagram: siteSettings.socialInstagram,
            facebook: siteSettings.socialFacebook,
            twitter: siteSettings.socialTwitter,
            youtube: siteSettings.socialYoutube,
          }}
        />
        <div className="border-t border-[#EDF1EE]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6B7D74]">
            <span>© {new Date().getFullYear()} {siteSettings.institutionName}. All rights reserved.</span>
            <span>Daya Campus · Makassar, South Sulawesi, Indonesia</span>
          </div>
        </div>
      </footer>

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selectedProgram.name}
        >
          <div
            className="fixed inset-0 bg-[#0F1F18]/45 backdrop-blur-[1px]"
            onClick={() => onSelectProgram(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-xl w-full bg-white border border-[#D4DDD6] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-[#E2E8E2] flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-[#0E5A36] mb-1">
                  {selectedProgram.code} · {selectedProgram.degree} · Accreditation{' '}
                  {selectedProgram.accreditation}
                </div>
                <h3 className="font-editorial text-2xl font-semibold text-[#0F1F18]">
                  {selectedProgram.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectProgram(null)}
                aria-label="Close program details"
                className="p-1.5 text-[#4A5D54] hover:text-[#0F1F18] hover:bg-[#F2F5F1] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-3 gap-4 p-4 bg-[#FAFBF9] border border-[#E2E8E2] rounded-lg text-xs">
                <div>
                  <div className="text-[#6B7D74]">Faculty</div>
                  <div className="font-semibold text-[#0F1F18] mt-0.5">
                    {selectedProgram.faculty}
                  </div>
                </div>
                <div>
                  <div className="text-[#6B7D74]">Duration</div>
                  <div className="font-semibold text-[#0F1F18] mt-0.5">
                    {selectedProgram.duration}
                  </div>
                </div>
                <div>
                  <div className="text-[#6B7D74]">Total Credits</div>
                  <div className="font-mono font-semibold text-[#0F1F18] tabular-nums mt-0.5">
                    {selectedProgram.credits} SKS
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#0F1F18] mb-1.5">Academic Overview</h4>
                <p className="text-sm text-[#4A5D54] leading-relaxed">{selectedProgram.summary}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#0F1F18] mb-1.5">
                  Graduate Career Pathways
                </h4>
                <p className="text-sm text-[#4A5D54] leading-relaxed">
                  {selectedProgram.careerOutcomes}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8E2] bg-[#FAFBF9] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onSelectProgram(null)}
                className="px-4 py-2 text-xs font-medium text-[#4A5D54] hover:text-[#0F1F18] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setInquiryForm((prev) => ({ ...prev, programCode: selectedProgram.code }));
                  setInquirySubmitted(false);
                  onSelectProgram(null);
                  setAdmissionsInquiryOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg cursor-pointer"
              >
                Request Admissions Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article / News / Announcement Reader Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selectedPost.title}
        >
          <div
            className="fixed inset-0 bg-[#0F1F18]/45 backdrop-blur-[1px]"
            onClick={() => onSelectPost(null)}
            aria-hidden="true"
          />
          <article className="relative z-10 max-w-3xl w-full bg-white border border-[#D4DDD6] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="aspect-[16/7] w-full relative shrink-0">
              <ResilientImage
                src={selectedPost.coverImage}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
                fallbackTitle={selectedPost.title}
              />
              <button
                type="button"
                onClick={() => onSelectPost(null)}
                aria-label="Close article"
                className="absolute top-4 right-4 p-2 bg-white/95 text-[#0F1F18] rounded-lg shadow-sm hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto">
              <div className="text-xs text-[#4A5D54] mb-2">
                <span className="font-semibold text-[#0E5A36]">
                  {categoryLabel(selectedPost.category)}
                </span>
                <span aria-hidden="true"> · </span>
                <span className="tabular-nums">{formatReadableDate(selectedPost.publishedDate)}</span>
                <span aria-hidden="true"> · </span>
                <span>{selectedPost.authorName}</span>
                <span aria-hidden="true"> · </span>
                <span className="tabular-nums">{selectedPost.views} views</span>
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#0F1F18] leading-snug mb-5">
                {selectedPost.title}
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-[#27382F] leading-relaxed">
                {selectedPost.content.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </article>
        </div>
      )}

      {/* Agenda Event Detail Modal */}
      {selectedAgenda && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selectedAgenda.title}
        >
          <div
            className="fixed inset-0 bg-[#0F1F18]/45 backdrop-blur-[1px]"
            onClick={() => onSelectAgenda(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-lg w-full bg-white border border-[#D4DDD6] rounded-xl shadow-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-xs font-semibold text-[#0E5A36] mb-1">
                  Campus Agenda · {selectedAgenda.organizer}
                </div>
                <h3 className="font-editorial text-xl font-semibold text-[#0F1F18]">
                  {selectedAgenda.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectAgenda(null)}
                aria-label="Close event details"
                className="p-1.5 text-[#4A5D54] hover:text-[#0F1F18] hover:bg-[#F2F5F1] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-[#4A5D54] bg-[#FAFBF9] border border-[#E2E8E2] rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0E5A36]" />
                <span className="font-medium text-[#0F1F18]">
                  {formatReadableDate(selectedAgenda.eventDate)}
                </span>
                <span>· {selectedAgenda.timeRange}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0E5A36]" />
                <span>{selectedAgenda.location}</span>
              </div>
            </div>
            <p className="text-sm text-[#4A5D54] leading-relaxed mb-6">
              {selectedAgenda.description}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onSelectAgenda(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admissions Consultation Modal */}
      {admissionsInquiryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Admissions Inquiry"
        >
          <div
            className="fixed inset-0 bg-[#0F1F18]/45 backdrop-blur-[1px]"
            onClick={() => setAdmissionsInquiryOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-md w-full bg-white border border-[#D4DDD6] rounded-xl shadow-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-editorial text-xl font-semibold text-[#0F1F18]">
                  Admissions &amp; Scholarship Desk
                </h3>
                <p className="text-xs text-[#4A5D54] mt-0.5">{siteSettings.admissionsLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setAdmissionsInquiryOpen(false)}
                aria-label="Close admissions dialog"
                className="p-1.5 text-[#4A5D54] hover:text-[#0F1F18] hover:bg-[#F2F5F1] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inquirySubmitted ? (
              <div className="py-4">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#0E5A36] mb-2">
                  <GraduationCap className="w-5 h-5" />
                  Inquiry Recorded
                </div>
                <p className="text-sm text-[#4A5D54] leading-relaxed mb-5">
                  Thank you, {inquiryForm.fullName}. Our Admissions Bureau (PMB) at Daya Campus
                  will follow up with program brochures and Tahfidz scholarship details for{' '}
                  <span className="font-medium text-[#0F1F18]">{inquiryForm.programCode}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setAdmissionsInquiryOpen(false)}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg cursor-pointer"
                >
                  Return to Portal
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.fullName}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, fullName: e.target.value })}
                    placeholder="e.g. Muhammad Fathur"
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg focus:outline-none focus:border-[#0E5A36]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg focus:outline-none focus:border-[#0E5A36]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    WhatsApp / Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={inquiryForm.phone}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                    placeholder="+62 812 ..."
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg focus:outline-none focus:border-[#0E5A36]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Preferred Program
                  </label>
                  <select
                    value={inquiryForm.programCode}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, programCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white focus:outline-none focus:border-[#0E5A36]"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.code}>
                        {p.code} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAdmissionsInquiryOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-[#4A5D54] hover:text-[#0F1F18] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
