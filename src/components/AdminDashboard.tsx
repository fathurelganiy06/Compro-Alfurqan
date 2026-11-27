import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Bell,
  Calendar,
  Check,
  Database,
  Edit3,
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  Images,
  LogOut,
  MessageSquareQuote,
  Newspaper,
  Plus,
  RotateCcw,
  Send,
  Settings,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import { COVER_IMAGE_PRESETS, UNIVERSITY_MEDIA } from '../data/defaultCampusData';
import {
  compressImageFileToDataUrl,
  sanitizeGalleryImageUrl,
  type AcademicProgram,
  type AgendaCategory,
  type AgendaEvent,
  type AgendaStatus,
  type AlumniTestimonial,
  type CampusNotification,
  type DegreeLevel,
  type GalleryCategory,
  type GalleryPhoto,
  type Post,
  type PostCategory,
  type PostPriority,
  type PostStatus,
} from '../types/cms';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ResilientImage } from './ResilientImage';

type AdminTab =
  | 'analytics'
  | 'posts'
  | 'programs'
  | 'agenda'
  | 'gallery'
  | 'alumni'
  | 'notifications'
  | 'settings';

interface AdminDashboardProps {
  onBackToPortal: () => void;
}

const NAV_ITEMS: { id: AdminTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'analytics', label: 'Site Analytics', Icon: BarChart3 },
  { id: 'posts', label: 'News & Notices', Icon: Newspaper },
  { id: 'programs', label: 'Programs', Icon: GraduationCap },
  { id: 'agenda', label: 'Campus Agenda', Icon: Calendar },
  { id: 'gallery', label: 'Campus Gallery', Icon: Images },
  { id: 'alumni', label: 'Alumni Stories', Icon: MessageSquareQuote },
  { id: 'notifications', label: 'Live Alerts', Icon: Bell },
  { id: 'settings', label: 'Site Profile', Icon: Settings },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToPortal }) => {
  const {
    user,
    isDemoMode,
    isCloudSynced,
    signOutUser,
    resetDemoData,
    siteSettings,
    programs,
    posts,
    agenda,
    testimonials,
    galleryPhotos,
    notifications,
    isFirestoreSeeded,
    isSeeding,
    seedInitialDatabase,
    saveSiteSettings,
    saveProgram,
    deleteProgram,
    savePost,
    deletePost,
    saveAgenda,
    deleteAgenda,
    saveTestimonial,
    deleteTestimonial,
    saveGalleryPhoto,
    deleteGalleryPhoto,
    toggleGalleryPhotoActive,
    reorderGalleryPhoto,
    broadcastNotification,
    toggleNotificationActive,
    deleteNotification,
  } = useCampus();

  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Posts CRUD state
  const [postFilter, setPostFilter] = useState<'all' | PostCategory>('all');
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    category: 'news' as PostCategory,
    excerpt: '',
    content: '',
    coverImage: COVER_IMAGE_PRESETS[0].url as string,
    authorName: 'Campus Public Relations',
    status: 'published' as PostStatus,
    priority: 'normal' as PostPriority,
    featured: false,
    views: 0,
    publishedDate: new Date().toISOString().slice(0, 10),
    alsoNotify: true,
  });

  // Programs CRUD state
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null);
  const [programForm, setProgramForm] = useState({
    code: '',
    name: '',
    degree: 'S1' as DegreeLevel,
    faculty: 'Faculty of Tarbiyah',
    accreditation: 'Baik',
    duration: '8 Semesters',
    credits: 144,
    summary: '',
    careerOutcomes: '',
    featured: true,
    active: true,
  });

  // Agenda CRUD state
  const [agendaModalOpen, setAgendaModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<AgendaEvent | null>(null);
  const [agendaForm, setAgendaForm] = useState({
    title: '',
    eventDate: new Date().toISOString().slice(0, 10),
    timeRange: '09:00 – 12:00 WITA',
    location: 'Main Auditorium, Daya Campus',
    organizer: 'Academic Administration Bureau',
    category: 'academic' as AgendaCategory,
    description: '',
    status: 'upcoming' as AgendaStatus,
    active: true,
    alsoNotify: true,
  });

  // Alumni CRUD state
  const [alumniModalOpen, setAlumniModalOpen] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<AlumniTestimonial | null>(null);
  const [alumniForm, setAlumniForm] = useState({
    name: '',
    graduationYear: 2023,
    program: 'S1 Pendidikan Agama Islam',
    role: '',
    organization: '',
    quote: '',
    featured: true,
    active: true,
  });

  // Campus Life Gallery CRUD state
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [galleryUploadBusy, setGalleryUploadBusy] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);
  const [gallerySourceMode, setGallerySourceMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    caption: '',
    category: 'campus' as GalleryCategory,
    imageUrl: '',
    photographer: 'Campus Media Bureau',
    displayOrder: 1,
    active: true,
  });

  // Live Notification Broadcaster state
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    type: 'announcement' as CampusNotification['type'],
    targetSection: 'news',
  });

  // Site Settings form state
  const [settingsForm, setSettingsForm] = useState({
    institutionName: siteSettings.institutionName,
    heroTitle: siteSettings.heroTitle,
    heroSubtitle: siteSettings.heroSubtitle,
    admissionsOpen: siteSettings.admissionsOpen,
    admissionsLabel: siteSettings.admissionsLabel,
    vision: siteSettings.vision,
    mission: siteSettings.mission,
    rectorName: siteSettings.rectorName,
    rectorTitle: siteSettings.rectorTitle,
    rectorMessage: siteSettings.rectorMessage,
    address: siteSettings.address,
    phone: siteSettings.phone,
    email: siteSettings.email,
    socialInstagram: siteSettings.socialInstagram,
    socialFacebook: siteSettings.socialFacebook,
    socialTwitter: siteSettings.socialTwitter,
    socialYoutube: siteSettings.socialYoutube,
  });

  useEffect(() => {
    setSettingsForm({
      institutionName: siteSettings.institutionName,
      heroTitle: siteSettings.heroTitle,
      heroSubtitle: siteSettings.heroSubtitle,
      admissionsOpen: siteSettings.admissionsOpen,
      admissionsLabel: siteSettings.admissionsLabel,
      vision: siteSettings.vision,
      mission: siteSettings.mission,
      rectorName: siteSettings.rectorName,
      rectorTitle: siteSettings.rectorTitle,
      rectorMessage: siteSettings.rectorMessage,
      address: siteSettings.address,
      phone: siteSettings.phone,
      email: siteSettings.email,
      socialInstagram: siteSettings.socialInstagram,
      socialFacebook: siteSettings.socialFacebook,
      socialTwitter: siteSettings.socialTwitter,
      socialYoutube: siteSettings.socialYoutube,
    });
  }, [siteSettings]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackBanner({ type, text });
    window.setTimeout(() => {
      setFeedbackBanner((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const filteredPosts = useMemo(() => {
    if (postFilter === 'all') return posts;
    return posts.filter((p) => p.category === postFilter);
  }, [posts, postFilter]);

  // --- Handlers (Demo Credential Bypass: direct access without sign-in) ---
  const openNewPost = () => {
    setEditingPost(null);
    setPostForm({
      title: '',
      slug: '',
      category: 'news',
      excerpt: '',
      content: '',
      coverImage: COVER_IMAGE_PRESETS[0].url,
      authorName: user?.displayName || 'Campus Public Relations',
      status: 'published',
      priority: 'normal',
      featured: false,
      views: 0,
      publishedDate: new Date().toISOString().slice(0, 10),
      alsoNotify: true,
    });
    setPostModalOpen(true);
  };

  const openEditPost = (post: Post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      authorName: post.authorName,
      status: post.status,
      priority: post.priority,
      featured: post.featured,
      views: post.views,
      publishedDate: post.publishedDate,
      alsoNotify: false,
    });
    setPostModalOpen(true);
  };

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postForm.title.trim().length < 4 || postForm.excerpt.trim().length < 10 || postForm.content.trim().length < 20) {
      showFeedback('error', 'Please complete title (4+ chars), excerpt (10+ chars), and body (20+ chars).');
      return;
    }
    setBusy(true);
    try {
      const { alsoNotify, ...payload } = postForm;
      await savePost(payload, editingPost, alsoNotify);
      setPostModalOpen(false);
      showFeedback(
        'success',
        editingPost ? 'Publication updated live.' : 'Publication saved and published.',
      );
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to save publication.');
    } finally {
      setBusy(false);
    }
  };

  const openNewProgram = () => {
    setEditingProgram(null);
    setProgramForm({
      code: '',
      name: '',
      degree: 'S1',
      faculty: 'Faculty of Tarbiyah',
      accreditation: 'Baik',
      duration: '8 Semesters',
      credits: 144,
      summary: '',
      careerOutcomes: '',
      featured: true,
      active: true,
    });
    setProgramModalOpen(true);
  };

  const openEditProgram = (prog: AcademicProgram) => {
    setEditingProgram(prog);
    setProgramForm({
      code: prog.code,
      name: prog.name,
      degree: prog.degree,
      faculty: prog.faculty,
      accreditation: prog.accreditation,
      duration: prog.duration,
      credits: prog.credits,
      summary: prog.summary,
      careerOutcomes: prog.careerOutcomes,
      featured: prog.featured,
      active: prog.active,
    });
    setProgramModalOpen(true);
  };

  const submitProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (programForm.name.trim().length < 3 || programForm.summary.trim().length < 10) {
      showFeedback('error', 'Please enter a valid program name and summary (10+ chars).');
      return;
    }
    setBusy(true);
    try {
      await saveProgram(programForm, editingProgram);
      setProgramModalOpen(false);
      showFeedback('success', 'Academic program saved live.');
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to save program.');
    } finally {
      setBusy(false);
    }
  };

  const openNewAgenda = () => {
    setEditingAgenda(null);
    setAgendaForm({
      title: '',
      eventDate: new Date().toISOString().slice(0, 10),
      timeRange: '09:00 – 12:00 WITA',
      location: 'Main Auditorium, Daya Campus',
      organizer: 'Academic Administration Bureau',
      category: 'academic',
      description: '',
      status: 'upcoming',
      active: true,
      alsoNotify: true,
    });
    setAgendaModalOpen(true);
  };

  const openEditAgenda = (evt: AgendaEvent) => {
    setEditingAgenda(evt);
    setAgendaForm({
      title: evt.title,
      eventDate: evt.eventDate,
      timeRange: evt.timeRange,
      location: evt.location,
      organizer: evt.organizer,
      category: evt.category,
      description: evt.description,
      status: evt.status,
      active: evt.active,
      alsoNotify: false,
    });
    setAgendaModalOpen(true);
  };

  const submitAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (agendaForm.title.trim().length < 4 || agendaForm.description.trim().length < 10) {
      showFeedback('error', 'Please provide an event title and description (10+ chars).');
      return;
    }
    setBusy(true);
    try {
      const { alsoNotify, ...payload } = agendaForm;
      await saveAgenda(payload, editingAgenda, alsoNotify);
      setAgendaModalOpen(false);
      showFeedback('success', 'Agenda event saved live.');
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to save agenda event.');
    } finally {
      setBusy(false);
    }
  };

  const openNewAlumni = () => {
    setEditingAlumni(null);
    setAlumniForm({
      name: '',
      graduationYear: 2023,
      program: 'S1 Pendidikan Agama Islam',
      role: '',
      organization: '',
      quote: '',
      featured: true,
      active: true,
    });
    setAlumniModalOpen(true);
  };

  const openEditAlumni = (item: AlumniTestimonial) => {
    setEditingAlumni(item);
    setAlumniForm({
      name: item.name,
      graduationYear: item.graduationYear,
      program: item.program,
      role: item.role,
      organization: item.organization,
      quote: item.quote,
      featured: item.featured,
      active: item.active,
    });
    setAlumniModalOpen(true);
  };

  const submitAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (alumniForm.name.trim().length < 2 || alumniForm.quote.trim().length < 15) {
      showFeedback('error', 'Please enter alumni name and testimonial quote (15+ chars).');
      return;
    }
    setBusy(true);
    try {
      await saveTestimonial(alumniForm, editingAlumni);
      setAlumniModalOpen(false);
      showFeedback('success', 'Alumni testimonial saved live.');
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to save testimonial.');
    } finally {
      setBusy(false);
    }
  };

  const orderedGalleryPhotos = useMemo(
    () =>
      [...galleryPhotos].sort(
        (a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title),
      ),
    [galleryPhotos],
  );

  const openNewGalleryPhoto = () => {
    setEditingPhoto(null);
    setGalleryUploadError(null);
    setGallerySourceMode('upload');
    const nextOrder =
      orderedGalleryPhotos.length > 0
        ? Math.max(...orderedGalleryPhotos.map((p) => p.displayOrder)) + 1
        : 1;
    setGalleryForm({
      title: '',
      caption: '',
      category: 'campus',
      imageUrl: '',
      photographer: user?.displayName || 'Campus Media Bureau',
      displayOrder: nextOrder,
      active: true,
    });
    setGalleryModalOpen(true);
  };

  const openEditGalleryPhoto = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setGalleryUploadError(null);
    setGallerySourceMode(
      photo.imageUrl.startsWith('data:image/')
        ? 'upload'
        : COVER_IMAGE_PRESETS.some((p) => p.url === photo.imageUrl)
          ? 'preset'
          : 'url',
    );
    setGalleryForm({
      title: photo.title,
      caption: photo.caption,
      category: photo.category,
      imageUrl: photo.imageUrl,
      photographer: photo.photographer,
      displayOrder: photo.displayOrder,
      active: photo.active,
    });
    setGalleryModalOpen(true);
  };

  const handleGalleryFileSelected = async (file: File | null) => {
    if (!file) return;
    setGalleryUploadError(null);
    setGalleryUploadBusy(true);
    try {
      const optimizedDataUrl = await compressImageFileToDataUrl(file);
      setGalleryForm((prev) => ({
        ...prev,
        imageUrl: optimizedDataUrl,
        title:
          prev.title.trim().length > 0
            ? prev.title
            : file.name
                .replace(/\.[^.]+$/, '')
                .replace(/[_-]+/g, ' ')
                .trim()
                .slice(0, 140),
      }));
    } catch (err) {
      setGalleryUploadError(err instanceof Error ? err.message : 'Unable to process image file.');
    } finally {
      setGalleryUploadBusy(false);
    }
  };

  const submitGalleryPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (galleryForm.title.trim().length < 3 || galleryForm.caption.trim().length < 5) {
      showFeedback('error', 'Please enter a photo title (3+ chars) and caption (5+ chars).');
      return;
    }
    if (!sanitizeGalleryImageUrl(galleryForm.imageUrl)) {
      showFeedback('error', 'Please upload a photo, choose a preset, or enter a valid https:// image URL.');
      return;
    }
    setBusy(true);
    try {
      await saveGalleryPhoto(galleryForm, editingPhoto);
      setGalleryModalOpen(false);
      showFeedback(
        'success',
        editingPhoto
          ? 'Campus gallery slide updated live.'
          : 'Campus photo uploaded and published to the landing carousel.',
      );
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to save gallery photograph.');
    } finally {
      setBusy(false);
    }
  };

  const submitBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (notifForm.title.trim().length < 3 || notifForm.message.trim().length < 5) {
      showFeedback('error', 'Enter a notification title (3+ chars) and message (5+ chars).');
      return;
    }
    setBusy(true);
    try {
      await broadcastNotification(notifForm);
      setNotifForm({
        title: '',
        message: '',
        type: 'announcement',
        targetSection: 'news',
      });
      showFeedback('success', 'Real-time notification broadcast to all connected portals.');
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to send notification.');
    } finally {
      setBusy(false);
    }
  };

  const submitSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveSiteSettings(settingsForm);
      showFeedback('success', 'University profile settings updated live.');
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to save site profile.');
    } finally {
      setBusy(false);
    }
  };

  const currentTabLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#FAFBF9] flex flex-col lg:flex-row">
      {/* Desktop Sidebar (256px) */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 bg-white border-r border-[#E2E8E2] flex-col justify-between">
        <div>
          <div className="h-16 px-5 border-b border-[#E2E8E2] flex items-center gap-3">
            <img
              src={UNIVERSITY_MEDIA.logo}
              alt="STAI Al-Furqan Crest"
              className="w-8 h-8 rounded-full object-cover border border-[#E2E8E2]"
            />
            <div className="min-w-0">
              <div className="font-editorial text-sm font-semibold text-[#0F1F18] truncate">
                STAI Al-Furqan
              </div>
              <div className="text-[11px] text-[#4A5D54]">University CMS</div>
            </div>
          </div>

          <nav className="p-3 space-y-1" aria-label="CMS Sections">
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setActiveTab(id);
                    setConfirmDeleteId(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#0E5A36] text-white'
                      : 'text-[#4A5D54] hover:text-[#0F1F18] hover:bg-[#F2F5F1]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#E2E8E2] space-y-3">
          <div className="text-xs">
            <div className="font-semibold text-[#0F1F18] truncate">
              {user?.displayName || 'Demo Administrator'}
            </div>
            <div className="text-[#6B7D74] truncate">
              {isCloudSynced && user?.email ? user.email : 'Demo Mode · Direct CMS Access'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToPortal}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#0F1F18] border border-[#D4DDD6] hover:bg-[#F2F5F1] rounded-lg cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              Portal
            </button>
            {isCloudSynced ? (
              <button
                type="button"
                onClick={() => void signOutUser()}
                aria-label="Sign out"
                className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-[#4A5D54] border border-[#D4DDD6] hover:text-red-700 hover:border-red-200 rounded-lg cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              isDemoMode && (
                <button
                  type="button"
                  onClick={() => {
                    resetDemoData();
                    showFeedback('success', 'Demo content restored to initial campus defaults.');
                  }}
                  title="Reset demo changes"
                  aria-label="Reset demo changes"
                  className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-[#4A5D54] border border-[#D4DDD6] hover:text-[#0E5A36] hover:bg-[#F2F5F1] rounded-lg cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Contextual Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8E2]">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#4A5D54] min-w-0">
              <span className="hidden sm:inline">STAI Al-Furqan CMS</span>
              <span className="hidden sm:inline" aria-hidden="true">/</span>
              <span className="font-semibold text-[#0F1F18] truncate">{currentTabLabel}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isCloudSynced && !isFirestoreSeeded && (
                <button
                  type="button"
                  disabled={isSeeding}
                  onClick={() => void seedInitialDatabase()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#0E5A36] border border-[#0E5A36]/40 hover:bg-[#F2F5F1] rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  {isSeeding ? 'Syncing DB...' : 'Initialize Firestore Seed'}
                </button>
              )}
              <button
                type="button"
                onClick={onBackToPortal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#0F1F18] border border-[#D4DDD6] hover:bg-[#F2F5F1] rounded-lg whitespace-nowrap cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                View Live Site
              </button>
            </div>
          </div>

          {/* Mobile Tab Bar */}
          <div className="lg:hidden px-4 pb-3 flex items-center gap-1.5 overflow-x-auto">
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === id
                    ? 'bg-[#0E5A36] text-white'
                    : 'bg-[#F2F5F1] text-[#4A5D54]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* Feedback Alert */}
        {feedbackBanner && (
          <div
            className={`px-6 py-3 text-xs font-medium border-b flex items-center justify-between ${
              feedbackBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <span>{feedbackBanner.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="p-1 cursor-pointer"
              aria-label="Dismiss message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Workspace Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {activeTab === 'analytics' && <AnalyticsDashboard />}

          {/* POSTS MANAGER */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-editorial text-2xl font-semibold text-[#0F1F18]">
                    News, Articles &amp; Announcements
                  </h2>
                  <p className="text-xs text-[#4A5D54] mt-0.5">
                    Create, publish, or schedule campus journalism and official announcements
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewPost}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  New Publication
                </button>
              </div>

              <div className="flex items-center gap-1 p-1 bg-white border border-[#D4DDD6] rounded-lg w-fit">
                {(['all', 'news', 'article', 'announcement'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPostFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                      postFilter === cat
                        ? 'bg-[#0E5A36] text-white'
                        : 'text-[#4A5D54] hover:text-[#0F1F18]'
                    }`}
                  >
                    {cat === 'all' ? 'All Posts' : cat}
                  </button>
                ))}
              </div>

              <div className="bg-white border border-[#E2E8E2] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8E2] bg-[#FAFBF9] text-[11px] font-semibold text-[#4A5D54]">
                        <th className="py-3 px-5">Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Published</th>
                        <th className="py-3 px-4 text-right">Views</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDF1EE] text-xs">
                      {filteredPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-[#FAFBF9]">
                          <td className="py-3.5 px-5 font-medium text-[#0F1F18] max-w-sm">
                            <div className="truncate">{post.title}</div>
                            <div className="text-[11px] text-[#6B7D74] truncate">{post.authorName}</div>
                          </td>
                          <td className="py-3.5 px-4 capitalize text-[#4A5D54]">{post.category}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={
                                post.status === 'published'
                                  ? 'text-[#0E5A36] font-semibold'
                                  : 'text-amber-700 font-semibold'
                              }
                            >
                              {post.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#6B7D74] tabular-nums whitespace-nowrap">
                            {post.publishedDate}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#0F1F18] text-right tabular-nums">
                            {post.views}
                          </td>
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditPost(post)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0F1F18] border border-[#D4DDD6] hover:bg-[#F2F5F1] rounded-md cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              {confirmDeleteId === post.id ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await deletePost(post.id);
                                    setConfirmDeleteId(null);
                                    showFeedback('success', 'Publication removed.');
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md cursor-pointer"
                                >
                                  Confirm
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(post.id)}
                                  aria-label={`Delete ${post.title}`}
                                  className="p-1.5 text-[#6B7D74] hover:text-red-700 rounded-md cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PROGRAMS MANAGER */}
          {activeTab === 'programs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-editorial text-2xl font-semibold text-[#0F1F18]">
                    Academic Program Listings
                  </h2>
                  <p className="text-xs text-[#4A5D54] mt-0.5">
                    Manage S1 undergraduate and S2 postgraduate study programs displayed on the portal
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewProgram}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Program
                </button>
              </div>

              <div className="bg-white border border-[#E2E8E2] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8E2] bg-[#FAFBF9] text-[11px] font-semibold text-[#4A5D54]">
                        <th className="py-3 px-5">Code</th>
                        <th className="py-3 px-4">Program Name</th>
                        <th className="py-3 px-4">Faculty</th>
                        <th className="py-3 px-4">Accreditation</th>
                        <th className="py-3 px-4 text-right">Credits</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDF1EE] text-xs">
                      {programs.map((prog) => (
                        <tr key={prog.id} className="hover:bg-[#FAFBF9]">
                          <td className="py-3.5 px-5 font-mono font-semibold text-[#0E5A36] whitespace-nowrap">
                            {prog.code}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-[#0F1F18]">
                            {prog.name}
                            {!prog.active && (
                              <span className="ml-2 text-[11px] text-amber-700">(Hidden)</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-[#4A5D54]">{prog.faculty}</td>
                          <td className="py-3.5 px-4 text-[#4A5D54]">{prog.accreditation}</td>
                          <td className="py-3.5 px-4 font-mono text-right tabular-nums">
                            {prog.credits}
                          </td>
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditProgram(prog)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0F1F18] border border-[#D4DDD6] hover:bg-[#F2F5F1] rounded-md cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              {confirmDeleteId === prog.id ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await deleteProgram(prog.id);
                                    setConfirmDeleteId(null);
                                    showFeedback('success', 'Program removed.');
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-white bg-red-700 rounded-md cursor-pointer"
                                >
                                  Confirm
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(prog.id)}
                                  aria-label={`Delete ${prog.name}`}
                                  className="p-1.5 text-[#6B7D74] hover:text-red-700 rounded-md cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AGENDA MANAGER */}
          {activeTab === 'agenda' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-editorial text-2xl font-semibold text-[#0F1F18]">
                    Campus Agenda &amp; Calendar
                  </h2>
                  <p className="text-xs text-[#4A5D54] mt-0.5">
                    Schedule academic deadlines, symposiums, MTQ events, and open house dates
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewAgenda}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Event
                </button>
              </div>

              <div className="bg-white border border-[#E2E8E2] rounded-xl divide-y divide-[#EDF1EE]">
                {agenda.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-[#0E5A36] tabular-nums mb-1">
                        {evt.eventDate} · {evt.timeRange} · {evt.status}
                      </div>
                      <div className="text-sm font-semibold text-[#0F1F18]">{evt.title}</div>
                      <div className="text-xs text-[#4A5D54] mt-0.5">
                        {evt.location} · {evt.organizer}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditAgenda(evt)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#0F1F18] border border-[#D4DDD6] hover:bg-[#F2F5F1] rounded-md cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      {confirmDeleteId === evt.id ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteAgenda(evt.id);
                            setConfirmDeleteId(null);
                            showFeedback('success', 'Agenda event deleted.');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-red-700 rounded-md cursor-pointer"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(evt.id)}
                          aria-label={`Delete ${evt.title}`}
                          className="p-1.5 text-[#6B7D74] hover:text-red-700 rounded-md cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CAMPUS LIFE GALLERY MANAGER */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-editorial text-2xl font-semibold text-[#0F1F18]">
                    Campus Life Photo Gallery
                  </h2>
                  <p className="text-xs text-[#4A5D54] mt-0.5">
                    Upload campus photographs, adjust carousel sequence, and manage slides displayed on the landing page
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewGalleryPhoto}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Upload Campus Photo
                </button>
              </div>

              {orderedGalleryPhotos.length === 0 ? (
                <div className="bg-white border border-[#E2E8E2] rounded-xl p-10 text-center">
                  <p className="text-sm text-[#4A5D54]">
                    No photographs in the campus gallery yet. Upload your first slide to populate the carousel.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {orderedGalleryPhotos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="bg-white border border-[#E2E8E2] rounded-xl overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-[16/9] w-full bg-[#F2F5F1] overflow-hidden">
                          <ResilientImage
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-full h-full object-cover"
                            fallbackTitle={photo.title}
                          />
                          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-[#071F13]/80 text-white font-mono text-[11px] tabular-nums">
                            Slide #{idx + 1}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="text-xs text-[#4A5D54] mb-1 capitalize">
                            <span className="font-semibold text-[#0E5A36]">
                              {photo.category.replace('-', ' ')}
                            </span>
                            <span aria-hidden="true"> · </span>
                            <span>{photo.photographer}</span>
                            <span aria-hidden="true"> · </span>
                            <span className={photo.active ? 'text-[#0E5A36] font-medium' : 'text-amber-700 font-medium'}>
                              {photo.active ? 'Visible' : 'Hidden'}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-[#0F1F18] leading-snug">
                            {photo.title}
                          </h3>
                          <p className="text-xs text-[#4A5D54] mt-1 line-clamp-2 leading-relaxed">
                            {photo.caption}
                          </p>
                        </div>
                      </div>

                      <div className="px-4 py-3 border-t border-[#EDF1EE] bg-[#FAFBF9] flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => void reorderGalleryPhoto(photo.id, 'up')}
                            aria-label={`Move ${photo.title} earlier`}
                            className="p-1.5 text-[#4A5D54] hover:text-[#0F1F18] hover:bg-white border border-transparent hover:border-[#D4DDD6] disabled:opacity-35 rounded-md cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === orderedGalleryPhotos.length - 1}
                            onClick={() => void reorderGalleryPhoto(photo.id, 'down')}
                            aria-label={`Move ${photo.title} later`}
                            className="p-1.5 text-[#4A5D54] hover:text-[#0F1F18] hover:bg-white border border-transparent hover:border-[#D4DDD6] disabled:opacity-35 rounded-md cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleGalleryPhotoActive(photo)}
                            aria-label={photo.active ? `Hide ${photo.title}` : `Show ${photo.title}`}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#4A5D54] hover:text-[#0F1F18] hover:bg-white border border-transparent hover:border-[#D4DDD6] rounded-md cursor-pointer"
                          >
                            {photo.active ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                Show
                              </>
                            )}
                          </button>
                        </div>

                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditGalleryPhoto(photo)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0F1F18] border border-[#D4DDD6] bg-white hover:bg-[#F2F5F1] rounded-md cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          {confirmDeleteId === photo.id ? (
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteGalleryPhoto(photo.id);
                                setConfirmDeleteId(null);
                                showFeedback('success', 'Photograph removed from gallery.');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md cursor-pointer"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(photo.id)}
                              aria-label={`Delete ${photo.title}`}
                              className="p-1.5 text-[#6B7D74] hover:text-red-700 rounded-md cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ALUMNI MANAGER */}
          {activeTab === 'alumni' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-editorial text-2xl font-semibold text-[#0F1F18]">
                    Alumni Testimonials
                  </h2>
                  <p className="text-xs text-[#4A5D54] mt-0.5">
                    Curate verified graduate career stories featured on the university landing page
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewAlumni}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Testimonial
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#E2E8E2] rounded-xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs text-[#0E5A36] font-medium mb-1">
                        {item.program} · Class of {item.graduationYear}
                      </div>
                      <div className="text-base font-semibold text-[#0F1F18]">{item.name}</div>
                      <div className="text-xs text-[#6B7D74] mb-3">
                        {item.role} · {item.organization}
                      </div>
                      <p className="text-xs text-[#4A5D54] leading-relaxed mb-4">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#EDF1EE] flex items-center justify-between">
                      <span className="text-[11px] text-[#6B7D74]">
                        {item.active ? 'Visible on portal' : 'Hidden'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditAlumni(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0F1F18] border border-[#D4DDD6] hover:bg-[#F2F5F1] rounded-md cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        {confirmDeleteId === item.id ? (
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteTestimonial(item.id);
                              setConfirmDeleteId(null);
                              showFeedback('success', 'Testimonial deleted.');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-red-700 rounded-md cursor-pointer"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            aria-label={`Delete ${item.name}`}
                            className="p-1.5 text-[#6B7D74] hover:text-red-700 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REAL-TIME NOTIFICATIONS BROADCASTER */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-editorial text-2xl font-semibold text-[#0F1F18]">
                  Real-Time Campus Notifications
                </h2>
                <p className="text-xs text-[#4A5D54] mt-0.5">
                  Send live alerts that appear instantaneously in connected visitors&apos; notification drawers
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <form
                  onSubmit={submitBroadcast}
                  className="lg:col-span-5 bg-white border border-[#E2E8E2] rounded-xl p-6 space-y-4 h-fit"
                >
                  <h3 className="text-base font-semibold text-[#0F1F18]">
                    Compose Live Broadcast
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                      Alert Title
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={140}
                      value={notifForm.title}
                      onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                      placeholder="e.g. Scholarship Verification Extended"
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg focus:outline-none focus:border-[#0E5A36]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                      Message Body
                    </label>
                    <textarea
                      required
                      rows={3}
                      maxLength={400}
                      value={notifForm.message}
                      onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                      placeholder="Provide clear instructions, deadline, or venue details..."
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg focus:outline-none focus:border-[#0E5A36]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                        Alert Category
                      </label>
                      <select
                        value={notifForm.type}
                        onChange={(e) =>
                          setNotifForm({
                            ...notifForm,
                            type: e.target.value as CampusNotification['type'],
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white"
                      >
                        <option value="announcement">Announcement</option>
                        <option value="urgent">Urgent Notice</option>
                        <option value="agenda">Agenda</option>
                        <option value="news">Campus News</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                        Target Section
                      </label>
                      <select
                        value={notifForm.targetSection}
                        onChange={(e) =>
                          setNotifForm({ ...notifForm, targetSection: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white"
                      >
                        <option value="news">News &amp; Notices</option>
                        <option value="agenda">Campus Agenda</option>
                        <option value="programs">Academic Programs</option>
                        <option value="campus-map">Campus Map</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] disabled:opacity-50 rounded-lg cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {busy ? 'Sending...' : 'Broadcast Live Notification'}
                  </button>
                </form>

                <div className="lg:col-span-7 bg-white border border-[#E2E8E2] rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E2E8E2]">
                    <h3 className="text-base font-semibold text-[#0F1F18]">
                      Active &amp; Archived Broadcasts ({notifications.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-[#EDF1EE]">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-6 py-4 flex items-start justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="text-xs text-[#4A5D54] mb-0.5 capitalize">
                            <span className="font-semibold text-[#0E5A36]">{notif.type}</span>
                            <span aria-hidden="true"> · </span>
                            <span>{notif.active ? 'Active' : 'Paused'}</span>
                          </div>
                          <div className="text-sm font-semibold text-[#0F1F18]">{notif.title}</div>
                          <p className="text-xs text-[#4A5D54] mt-1">{notif.message}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => void toggleNotificationActive(notif)}
                            className="px-2.5 py-1 text-xs font-medium text-[#0F1F18] border border-[#D4DDD6] hover:bg-[#F2F5F1] rounded-md cursor-pointer"
                          >
                            {notif.active ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteNotification(notif.id)}
                            aria-label={`Delete ${notif.title}`}
                            className="p-1.5 text-[#6B7D74] hover:text-red-700 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SITE IDENTITY & PROFILE SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={submitSettings} className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-editorial text-2xl font-semibold text-[#0F1F18]">
                    Site Identity &amp; Profile Configuration
                  </h2>
                  <p className="text-xs text-[#4A5D54] mt-0.5">
                    Changes update the public university homepage immediately
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] disabled:opacity-50 rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {busy ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <div className="bg-white border border-[#E2E8E2] rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-[#0F1F18]">Hero &amp; Admissions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={settingsForm.institutionName}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, institutionName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                      Admissions Banner Label
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={settingsForm.admissionsLabel}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, admissionsLabel: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Hero Headline
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={180}
                    value={settingsForm.heroTitle}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, heroTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Hero Subtitle
                  </label>
                  <textarea
                    rows={3}
                    required
                    maxLength={400}
                    value={settingsForm.heroSubtitle}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0F1F18] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.admissionsOpen}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, admissionsOpen: e.target.checked })
                    }
                    className="rounded border-[#D4DDD6] accent-[#0E5A36]"
                  />
                  Display active admissions announcement line in Hero section
                </label>
              </div>

              <div className="bg-white border border-[#E2E8E2] rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-[#0F1F18]">
                  Vision, Mission &amp; Leadership
                </h3>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Vision</label>
                  <textarea
                    rows={2}
                    required
                    maxLength={600}
                    value={settingsForm.vision}
                    onChange={(e) => setSettingsForm({ ...settingsForm, vision: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Mission</label>
                  <textarea
                    rows={3}
                    required
                    maxLength={1200}
                    value={settingsForm.mission}
                    onChange={(e) => setSettingsForm({ ...settingsForm, mission: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                      Chairman / Rector Name
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={settingsForm.rectorName}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, rectorName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                      Leadership Title
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={settingsForm.rectorTitle}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, rectorTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Rector&apos;s Statement
                  </label>
                  <textarea
                    rows={3}
                    required
                    maxLength={1000}
                    value={settingsForm.rectorMessage}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, rectorMessage: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-white border border-[#E2E8E2] rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-[#0F1F18]">Contact Information</h3>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Campus Address
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={300}
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">Phone</label>
                    <input
                      type="text"
                      required
                      maxLength={40}
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">Email</label>
                    <input
                      type="email"
                      required
                      maxLength={120}
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8E2] rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#0F1F18]">
                    Official Social Media Profiles
                  </h3>
                  <p className="text-xs text-[#4A5D54] mt-0.5">
                    Configure the university&apos;s official footer links. Leave a field blank to hide
                    that platform from the public footer.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      maxLength={300}
                      placeholder="https://www.instagram.com/staialfurqanmakassar"
                      value={settingsForm.socialInstagram}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, socialInstagram: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      maxLength={300}
                      placeholder="https://www.facebook.com/staialfurqanmakassar"
                      value={settingsForm.socialFacebook}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, socialFacebook: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                      Twitter / X URL
                    </label>
                    <input
                      type="url"
                      maxLength={300}
                      placeholder="https://x.com/staialfurqanmks"
                      value={settingsForm.socialTwitter}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, socialTwitter: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      maxLength={300}
                      placeholder="https://www.youtube.com/@staialfurqanmakassar"
                      value={settingsForm.socialYoutube}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, socialYoutube: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </main>
      </div>

      {/* POST EDITOR MODAL */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-[#0F1F18]/45" onClick={() => setPostModalOpen(false)} />
          <form
            onSubmit={submitPost}
            className="relative z-10 max-w-2xl w-full bg-white border border-[#D4DDD6] rounded-xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#E2E8E2] flex items-center justify-between">
              <h3 className="font-editorial text-xl font-semibold text-[#0F1F18]">
                {editingPost ? 'Edit Publication' : 'New News / Article / Announcement'}
              </h3>
              <button
                type="button"
                onClick={() => setPostModalOpen(false)}
                className="p-1.5 text-[#4A5D54] hover:text-[#0F1F18] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">Title</label>
                <input
                  type="text"
                  required
                  minLength={4}
                  maxLength={180}
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Category</label>
                  <select
                    value={postForm.category}
                    onChange={(e) =>
                      setPostForm({ ...postForm, category: e.target.value as PostCategory })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white"
                  >
                    <option value="news">News</option>
                    <option value="article">Scholarly Article</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Status</label>
                  <select
                    value={postForm.status}
                    onChange={(e) =>
                      setPostForm({ ...postForm, status: e.target.value as PostStatus })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Priority</label>
                  <select
                    value={postForm.priority}
                    onChange={(e) =>
                      setPostForm({ ...postForm, priority: e.target.value as PostPriority })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent Notice</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Author</label>
                  <input
                    type="text"
                    required
                    value={postForm.authorName}
                    onChange={(e) => setPostForm({ ...postForm, authorName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    required
                    value={postForm.publishedDate}
                    onChange={(e) => setPostForm({ ...postForm, publishedDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                  Cover Photography
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {COVER_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setPostForm({ ...postForm, coverImage: preset.url })}
                      className={`text-[11px] px-2.5 py-1.5 rounded-md border text-left truncate cursor-pointer ${
                        postForm.coverImage === preset.url
                          ? 'bg-[#0E5A36] text-white border-[#0E5A36]'
                          : 'bg-[#FAFBF9] text-[#4A5D54] border-[#D4DDD6]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                  Short Excerpt (10–400 characters)
                </label>
                <textarea
                  rows={2}
                  required
                  minLength={10}
                  maxLength={400}
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                  Article Body (separate paragraphs with a blank line)
                </label>
                <textarea
                  rows={6}
                  required
                  minLength={20}
                  maxLength={12000}
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>

              {!editingPost && (
                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0F1F18] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={postForm.alsoNotify}
                    onChange={(e) => setPostForm({ ...postForm, alsoNotify: e.target.checked })}
                    className="accent-[#0E5A36]"
                  />
                  Push real-time campus notification upon publishing
                </label>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8E2] bg-[#FAFBF9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPostModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#4A5D54] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] disabled:opacity-50 rounded-lg cursor-pointer"
              >
                {busy ? 'Saving...' : 'Save Publication'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PROGRAM EDITOR MODAL */}
      {programModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-[#0F1F18]/45" onClick={() => setProgramModalOpen(false)} />
          <form
            onSubmit={submitProgram}
            className="relative z-10 max-w-xl w-full bg-white border border-[#D4DDD6] rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#E2E8E2] flex items-center justify-between">
              <h3 className="font-editorial text-xl font-semibold text-[#0F1F18]">
                {editingProgram ? 'Edit Academic Program' : 'Add Academic Program'}
              </h3>
              <button
                type="button"
                onClick={() => setProgramModalOpen(false)}
                className="p-1.5 text-[#4A5D54] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={programForm.code}
                    onChange={(e) => setProgramForm({ ...programForm, code: e.target.value })}
                    placeholder="S1-PAI"
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Degree</label>
                  <select
                    value={programForm.degree}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, degree: e.target.value as DegreeLevel })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white"
                  >
                    <option value="S1">Undergraduate (S1)</option>
                    <option value="S2">Postgraduate (S2)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">Program Name</label>
                <input
                  type="text"
                  required
                  value={programForm.name}
                  onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Faculty</label>
                  <input
                    type="text"
                    required
                    value={programForm.faculty}
                    onChange={(e) => setProgramForm({ ...programForm, faculty: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Accreditation
                  </label>
                  <input
                    type="text"
                    required
                    value={programForm.accreditation}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, accreditation: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Credits (SKS)
                  </label>
                  <input
                    type="number"
                    min={24}
                    max={200}
                    required
                    value={programForm.credits}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, credits: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">Duration</label>
                <input
                  type="text"
                  required
                  value={programForm.duration}
                  onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">Summary</label>
                <textarea
                  rows={3}
                  required
                  value={programForm.summary}
                  onChange={(e) => setProgramForm({ ...programForm, summary: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                  Career Outcomes
                </label>
                <textarea
                  rows={2}
                  required
                  value={programForm.careerOutcomes}
                  onChange={(e) =>
                    setProgramForm({ ...programForm, careerOutcomes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0F1F18] cursor-pointer">
                <input
                  type="checkbox"
                  checked={programForm.active}
                  onChange={(e) => setProgramForm({ ...programForm, active: e.target.checked })}
                  className="accent-[#0E5A36]"
                />
                Visible on public portal
              </label>
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8E2] bg-[#FAFBF9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setProgramModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#4A5D54] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg cursor-pointer"
              >
                {busy ? 'Saving...' : 'Save Program'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AGENDA EDITOR MODAL */}
      {agendaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-[#0F1F18]/45" onClick={() => setAgendaModalOpen(false)} />
          <form
            onSubmit={submitAgenda}
            className="relative z-10 max-w-xl w-full bg-white border border-[#D4DDD6] rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#E2E8E2] flex items-center justify-between">
              <h3 className="font-editorial text-xl font-semibold text-[#0F1F18]">
                {editingAgenda ? 'Edit Agenda Event' : 'Add Campus Agenda Event'}
              </h3>
              <button
                type="button"
                onClick={() => setAgendaModalOpen(false)}
                className="p-1.5 text-[#4A5D54] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={agendaForm.title}
                  onChange={(e) => setAgendaForm({ ...agendaForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={agendaForm.eventDate}
                    onChange={(e) => setAgendaForm({ ...agendaForm, eventDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Time Range</label>
                  <input
                    type="text"
                    required
                    value={agendaForm.timeRange}
                    onChange={(e) => setAgendaForm({ ...agendaForm, timeRange: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={agendaForm.location}
                    onChange={(e) => setAgendaForm({ ...agendaForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Organizer</label>
                  <input
                    type="text"
                    required
                    value={agendaForm.organizer}
                    onChange={(e) => setAgendaForm({ ...agendaForm, organizer: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Category</label>
                  <select
                    value={agendaForm.category}
                    onChange={(e) =>
                      setAgendaForm({ ...agendaForm, category: e.target.value as AgendaCategory })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white"
                  >
                    <option value="academic">Academic</option>
                    <option value="admissions">Admissions</option>
                    <option value="seminar">Seminar</option>
                    <option value="student-life">Student Life</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Status</label>
                  <select
                    value={agendaForm.status}
                    onChange={(e) =>
                      setAgendaForm({ ...agendaForm, status: e.target.value as AgendaStatus })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={agendaForm.description}
                  onChange={(e) => setAgendaForm({ ...agendaForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>
              {!editingAgenda && (
                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0F1F18] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agendaForm.alsoNotify}
                    onChange={(e) => setAgendaForm({ ...agendaForm, alsoNotify: e.target.checked })}
                    className="accent-[#0E5A36]"
                  />
                  Broadcast real-time agenda notification
                </label>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8E2] bg-[#FAFBF9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAgendaModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#4A5D54] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg cursor-pointer"
              >
                {busy ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ALUMNI EDITOR MODAL */}
      {alumniModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-[#0F1F18]/45" onClick={() => setAlumniModalOpen(false)} />
          <form
            onSubmit={submitAlumni}
            className="relative z-10 max-w-xl w-full bg-white border border-[#D4DDD6] rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#E2E8E2] flex items-center justify-between">
              <h3 className="font-editorial text-xl font-semibold text-[#0F1F18]">
                {editingAlumni ? 'Edit Alumni Testimonial' : 'Add Alumni Testimonial'}
              </h3>
              <button
                type="button"
                onClick={() => setAlumniModalOpen(false)}
                className="p-1.5 text-[#4A5D54] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={alumniForm.name}
                    onChange={(e) => setAlumniForm({ ...alumniForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    min={1980}
                    max={2035}
                    required
                    value={alumniForm.graduationYear}
                    onChange={(e) =>
                      setAlumniForm({ ...alumniForm, graduationYear: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                  Degree Program
                </label>
                <input
                  type="text"
                  required
                  value={alumniForm.program}
                  onChange={(e) => setAlumniForm({ ...alumniForm, program: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Role</label>
                  <input
                    type="text"
                    required
                    value={alumniForm.role}
                    onChange={(e) => setAlumniForm({ ...alumniForm, role: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    required
                    value={alumniForm.organization}
                    onChange={(e) => setAlumniForm({ ...alumniForm, organization: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                  Testimonial Quote
                </label>
                <textarea
                  rows={4}
                  required
                  value={alumniForm.quote}
                  onChange={(e) => setAlumniForm({ ...alumniForm, quote: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8E2] bg-[#FAFBF9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAlumniModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#4A5D54] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg cursor-pointer"
              >
                {busy ? 'Saving...' : 'Save Testimonial'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CAMPUS GALLERY PHOTO UPLOAD / EDITOR MODAL */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-[#0F1F18]/45" onClick={() => setGalleryModalOpen(false)} />
          <form
            onSubmit={submitGalleryPhoto}
            className="relative z-10 max-w-2xl w-full bg-white border border-[#D4DDD6] rounded-xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#E2E8E2] flex items-center justify-between">
              <h3 className="font-editorial text-xl font-semibold text-[#0F1F18]">
                {editingPhoto ? 'Edit Campus Gallery Slide' : 'Upload Campus Life Photograph'}
              </h3>
              <button
                type="button"
                onClick={() => setGalleryModalOpen(false)}
                className="p-1.5 text-[#4A5D54] hover:text-[#0F1F18] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* Image Source Selector */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-medium text-[#0F1F18]">Photograph Source</label>
                  <div className="inline-flex items-center gap-1 p-0.5 bg-[#F2F5F1] border border-[#D4DDD6] rounded-md">
                    {(
                      [
                        ['upload', 'Upload File'],
                        ['preset', 'Campus Presets'],
                        ['url', 'Image URL'],
                      ] as const
                    ).map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setGallerySourceMode(mode);
                          setGalleryUploadError(null);
                        }}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                          gallerySourceMode === mode
                            ? 'bg-white text-[#0F1F18] shadow-xs'
                            : 'text-[#4A5D54] hover:text-[#0F1F18]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {gallerySourceMode === 'upload' && (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dropped = e.dataTransfer.files?.[0] ?? null;
                      void handleGalleryFileSelected(dropped);
                    }}
                    className="border-2 border-dashed border-[#D4DDD6] hover:border-[#0E5A36] bg-[#FAFBF9] rounded-xl p-5 text-center transition-colors"
                  >
                    <input
                      ref={galleryFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        void handleGalleryFileSelected(file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-[#0E5A36] mx-auto mb-2" />
                    <div className="text-xs font-medium text-[#0F1F18]">
                      {galleryUploadBusy
                        ? 'Optimizing image for fast web delivery...'
                        : 'Drag and drop a campus photo here, or browse from your device'}
                    </div>
                    <p className="text-[11px] text-[#6B7D74] mt-1">
                      JPG, PNG, or WebP · Automatically resized and compressed for fast carousel loading
                    </p>
                    <button
                      type="button"
                      disabled={galleryUploadBusy}
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="mt-3 px-4 py-1.5 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] disabled:opacity-50 rounded-lg cursor-pointer"
                    >
                      {galleryUploadBusy ? 'Processing...' : 'Choose Image File'}
                    </button>
                  </div>
                )}

                {gallerySourceMode === 'preset' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COVER_IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setGalleryForm((prev) => ({ ...prev, imageUrl: preset.url }))}
                        className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                          galleryForm.imageUrl === preset.url
                            ? 'border-[#0E5A36] bg-[#F2F5F1]'
                            : 'border-[#D4DDD6] hover:bg-[#FAFBF9]'
                        }`}
                      >
                        <div className="aspect-[16/10] w-full rounded overflow-hidden bg-[#E8EFEA] mb-1.5">
                          <ResilientImage
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                            fallbackTitle={preset.label}
                          />
                        </div>
                        <div className="text-[11px] font-medium text-[#0F1F18] truncate">
                          {preset.label}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {gallerySourceMode === 'url' && (
                  <div>
                    <input
                      type="url"
                      placeholder="https://example.edu/photos/campus-courtyard.jpg"
                      value={galleryForm.imageUrl.startsWith('data:') ? '' : galleryForm.imageUrl}
                      onChange={(e) =>
                        setGalleryForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                    />
                    <p className="text-[11px] text-[#6B7D74] mt-1">
                      Enter an HTTPS image URL for a verified university photograph.
                    </p>
                  </div>
                )}

                {galleryUploadError && (
                  <p className="text-xs text-red-700 mt-2">{galleryUploadError}</p>
                )}

                {galleryForm.imageUrl && (
                  <div className="mt-3 border border-[#E2E8E2] rounded-lg overflow-hidden bg-[#FAFBF9]">
                    <div className="aspect-[16/9] max-h-48 w-full overflow-hidden bg-[#092919]">
                      <ResilientImage
                        src={galleryForm.imageUrl}
                        alt={galleryForm.title || 'Selected campus photograph preview'}
                        className="w-full h-full object-cover"
                        fallbackTitle="Photograph Preview"
                      />
                    </div>
                    <div className="px-3 py-1.5 text-[11px] text-[#4A5D54] flex items-center justify-between">
                      <span>
                        {galleryForm.imageUrl.startsWith('data:image/')
                          ? `Uploaded photo ready (${Math.round(galleryForm.imageUrl.length / 1024)} KB optimized)`
                          : 'Preview loaded'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGalleryForm((prev) => ({ ...prev, imageUrl: '' }))}
                        className="text-red-700 hover:underline cursor-pointer"
                      >
                        Clear image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                  Photo Title (3–140 characters)
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={140}
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="e.g. Morning Discussion at Daya Campus Courtyard"
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                  Caption (5–320 characters)
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={5}
                  maxLength={320}
                  value={galleryForm.caption}
                  onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                  placeholder="Describe the campus scene, student activity, or academic milestone..."
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Category</label>
                  <select
                    value={galleryForm.category}
                    onChange={(e) =>
                      setGalleryForm({
                        ...galleryForm,
                        category: e.target.value as GalleryCategory,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white"
                  >
                    <option value="campus">Campus Architecture</option>
                    <option value="academics">Academics</option>
                    <option value="student-life">Student Life</option>
                    <option value="events">Events</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Photographer / Credit
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={galleryForm.photographer}
                    onChange={(e) =>
                      setGalleryForm({ ...galleryForm, photographer: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Slide Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    required
                    value={galleryForm.displayOrder}
                    onChange={(e) =>
                      setGalleryForm({
                        ...galleryForm,
                        displayOrder: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0F1F18] cursor-pointer">
                <input
                  type="checkbox"
                  checked={galleryForm.active}
                  onChange={(e) => setGalleryForm({ ...galleryForm, active: e.target.checked })}
                  className="accent-[#0E5A36]"
                />
                Publish this photograph in the public landing page carousel
              </label>
            </div>

            <div className="px-6 py-4 border-t border-[#E2E8E2] bg-[#FAFBF9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setGalleryModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#4A5D54] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || galleryUploadBusy}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] disabled:opacity-50 rounded-lg cursor-pointer"
              >
                {busy ? 'Saving...' : editingPhoto ? 'Update Slide' : 'Publish to Carousel'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
