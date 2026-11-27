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
  { id: 'analytics', label: 'Analitik Situs', Icon: BarChart3 },
  { id: 'posts', label: 'Berita & Info', Icon: Newspaper },
  { id: 'programs', label: 'Program Studi', Icon: GraduationCap },
  { id: 'agenda', label: 'Agenda Kampus', Icon: Calendar },
  { id: 'gallery', label: 'Galeri Kampus', Icon: Images },
  { id: 'alumni', label: 'Kisah Alumni', Icon: MessageSquareQuote },
  { id: 'notifications', label: 'Notifikasi Live', Icon: Bell },
  { id: 'settings', label: 'Profil Situs', Icon: Settings },
];

function postCategoryLabel(cat: PostCategory): string {
  if (cat === 'announcement') return 'Pengumuman';
  if (cat === 'article') return 'Artikel Ilmiah';
  return 'Berita';
}

function agendaStatusLabel(status: AgendaStatus): string {
  if (status === 'ongoing') return 'Berlangsung';
  if (status === 'completed') return 'Selesai';
  return 'Akan Datang';
}

function galleryCategoryLabel(cat: GalleryCategory): string {
  if (cat === 'academics') return 'Akademik';
  if (cat === 'student-life') return 'Kemahasiswaan';
  if (cat === 'events') return 'Kegiatan';
  return 'Kampus';
}

function notifTypeLabel(type: CampusNotification['type']): string {
  if (type === 'urgent') return 'Info Penting';
  if (type === 'agenda') return 'Agenda';
  if (type === 'news') return 'Berita Kampus';
  return 'Pengumuman';
}

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
    authorName: 'Humas Kampus',
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
    faculty: 'Fakultas Tarbiyah',
    accreditation: 'Baik',
    duration: '8 Semester',
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
    timeRange: '09.00 – 12.00 WITA',
    location: 'Auditorium Utama, Kampus Daya',
    organizer: 'Biro Administrasi Akademik',
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
    photographer: 'Unit Media Kampus',
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
      authorName: user?.displayName || 'Humas Kampus',
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
      showFeedback('error', 'Mohon lengkapi judul (minimal 4 karakter), ringkasan (minimal 10 karakter), dan isi artikel (minimal 20 karakter).');
      return;
    }
    setBusy(true);
    try {
      const { alsoNotify, ...payload } = postForm;
      await savePost(payload, editingPost, alsoNotify);
      setPostModalOpen(false);
      showFeedback(
        'success',
        editingPost ? 'Publikasi berhasil diperbarui.' : 'Publikasi berhasil disimpan dan diterbitkan.',
      );
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal menyimpan publikasi.');
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
      faculty: 'Fakultas Tarbiyah',
      accreditation: 'Baik',
      duration: '8 Semester',
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
      showFeedback('error', 'Mohon masukkan nama program studi dan ringkasan yang valid (minimal 10 karakter).');
      return;
    }
    setBusy(true);
    try {
      await saveProgram(programForm, editingProgram);
      setProgramModalOpen(false);
      showFeedback('success', 'Data program studi berhasil disimpan.');
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal menyimpan program studi.');
    } finally {
      setBusy(false);
    }
  };

  const openNewAgenda = () => {
    setEditingAgenda(null);
    setAgendaForm({
      title: '',
      eventDate: new Date().toISOString().slice(0, 10),
      timeRange: '09.00 – 12.00 WITA',
      location: 'Auditorium Utama, Kampus Daya',
      organizer: 'Biro Administrasi Akademik',
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
      showFeedback('error', 'Mohon isi judul kegiatan dan deskripsi (minimal 10 karakter).');
      return;
    }
    setBusy(true);
    try {
      const { alsoNotify, ...payload } = agendaForm;
      await saveAgenda(payload, editingAgenda, alsoNotify);
      setAgendaModalOpen(false);
      showFeedback('success', 'Agenda kampus berhasil disimpan.');
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal menyimpan agenda kampus.');
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
      showFeedback('error', 'Mohon isi nama alumni dan kutipan testimoni (minimal 15 karakter).');
      return;
    }
    setBusy(true);
    try {
      await saveTestimonial(alumniForm, editingAlumni);
      setAlumniModalOpen(false);
      showFeedback('success', 'Testimoni alumni berhasil disimpan.');
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal menyimpan testimoni.');
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
      photographer: user?.displayName || 'Unit Media Kampus',
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
      setGalleryUploadError(err instanceof Error ? err.message : 'Gagal memproses berkas gambar.');
    } finally {
      setGalleryUploadBusy(false);
    }
  };

  const submitGalleryPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (galleryForm.title.trim().length < 3 || galleryForm.caption.trim().length < 5) {
      showFeedback('error', 'Mohon isi judul foto (minimal 3 karakter) dan keterangan (minimal 5 karakter).');
      return;
    }
    if (!sanitizeGalleryImageUrl(galleryForm.imageUrl)) {
      showFeedback('error', 'Mohon unggah foto, pilih foto bawaan, atau masukkan tautan gambar https:// yang valid.');
      return;
    }
    setBusy(true);
    try {
      await saveGalleryPhoto(galleryForm, editingPhoto);
      setGalleryModalOpen(false);
      showFeedback(
        'success',
        editingPhoto
          ? 'Slide galeri kampus berhasil diperbarui.'
          : 'Foto kampus berhasil diunggah dan ditampilkan pada karusel beranda.',
      );
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal menyimpan foto galeri.');
    } finally {
      setBusy(false);
    }
  };

  const submitBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (notifForm.title.trim().length < 3 || notifForm.message.trim().length < 5) {
      showFeedback('error', 'Masukkan judul notifikasi (minimal 3 karakter) dan isi pesan (minimal 5 karakter).');
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
      showFeedback('success', 'Notifikasi real-time berhasil disiarkan ke seluruh portal pengunjung.');
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal mengirim notifikasi.');
    } finally {
      setBusy(false);
    }
  };

  const submitSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveSiteSettings(settingsForm);
      showFeedback('success', 'Pengaturan profil institusi berhasil diperbarui.');
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal menyimpan profil situs.');
    } finally {
      setBusy(false);
    }
  };

  const currentTabLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label || 'Dasbor';

  return (
    <div className="min-h-screen bg-[#FAFBF9] flex flex-col lg:flex-row">
      {/* Desktop Sidebar (256px) */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 bg-white border-r border-[#E2E8E2] flex-col justify-between">
        <div>
          <div className="h-16 px-5 border-b border-[#E2E8E2] flex items-center gap-3">
            <img
              src={UNIVERSITY_MEDIA.logo}
              alt="Logo STAI Al-Furqan Makassar"
              className="w-8 h-8 rounded-full object-cover border border-[#E2E8E2]"
            />
            <div className="min-w-0">
              <div className="font-editorial text-sm font-semibold text-[#0F1F18] truncate">
                STAI Al-Furqan
              </div>
              <div className="text-[11px] text-[#4A5D54]">CMS Kampus</div>
            </div>
          </div>

          <nav className="p-3 space-y-1" aria-label="Menu CMS">
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
              {user?.displayName || 'Administrator Demo'}
            </div>
            <div className="text-[#6B7D74] truncate">
              {isCloudSynced && user?.email ? user.email : 'Mode Demo · Akses CMS Langsung'}
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
                aria-label="Keluar akun"
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
                    showFeedback('success', 'Konten demo telah dikembalikan ke data awal kampus.');
                  }}
                  title="Atur ulang perubahan demo"
                  aria-label="Atur ulang perubahan demo"
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
              <span className="hidden sm:inline">CMS STAI Al-Furqan</span>
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
                  {isSeeding ? 'Menyinkronkan...' : 'Inisialisasi Data Firestore'}
                </button>
              )}
              <button
                type="button"
                onClick={onBackToPortal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#0F1F18] border border-[#D4DDD6] hover:bg-[#F2F5F1] rounded-lg whitespace-nowrap cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Lihat Situs Publik
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
              aria-label="Tutup pesan"
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
                    Berita, Artikel &amp; Pengumuman
                  </h2>
                  <p className="text-xs text-[#4A5D54] mt-0.5">
                    Buat, terbitkan, atau jadwalkan berita kampus, artikel ilmiah, dan pengumuman resmi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewPost}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Publikasi Baru
                </button>
              </div>

              <div className="flex items-center gap-1 p-1 bg-white border border-[#D4DDD6] rounded-lg w-fit">
                {(
                  [
                    ['all', 'Semua'],
                    ['news', 'Berita'],
                    ['article', 'Artikel'],
                    ['announcement', 'Pengumuman'],
                  ] as const
                ).map(([cat, label]) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPostFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      postFilter === cat
                        ? 'bg-[#0E5A36] text-white'
                        : 'text-[#4A5D54] hover:text-[#0F1F18]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="bg-white border border-[#E2E8E2] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8E2] bg-[#FAFBF9] text-[11px] font-semibold text-[#4A5D54]">
                        <th className="py-3 px-5">Judul</th>
                        <th className="py-3 px-4">Kategori</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Tanggal Terbit</th>
                        <th className="py-3 px-4 text-right">Tayangan</th>
                        <th className="py-3 px-5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDF1EE] text-xs">
                      {filteredPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-[#FAFBF9]">
                          <td className="py-3.5 px-5 font-medium text-[#0F1F18] max-w-sm">
                            <div className="truncate">{post.title}</div>
                            <div className="text-[11px] text-[#6B7D74] truncate">{post.authorName}</div>
                          </td>
                          <td className="py-3.5 px-4 text-[#4A5D54] whitespace-nowrap">
                            {postCategoryLabel(post.category)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={
                                post.status === 'published'
                                  ? 'text-[#0E5A36] font-semibold'
                                  : 'text-amber-700 font-semibold'
                              }
                            >
                              {post.status === 'published' ? 'Terbit' : 'Draf'}
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
                                Sunting
                              </button>
                              {confirmDeleteId === post.id ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await deletePost(post.id);
                                    setConfirmDeleteId(null);
                                    showFeedback('success', 'Publikasi telah dihapus.');
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md cursor-pointer"
                                >
                                  Konfirmasi
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(post.id)}
                                  aria-label={`Hapus ${post.title}`}
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
                    Daftar Program Studi
                  </h2>
                  <p className="text-xs text-[#4A5D54] mt-0.5">
                    Kelola program studi Sarjana (S1) dan Pascasarjana (S2) yang tampil di portal publik
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewProgram}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Program Studi
                </button>
              </div>

              <div className="bg-white border border-[#E2E8E2] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8E2] bg-[#FAFBF9] text-[11px] font-semibold text-[#4A5D54]">
                        <th className="py-3 px-5">Kode</th>
                        <th className="py-3 px-4">Nama Program Studi</th>
                        <th className="py-3 px-4">Fakultas</th>
                        <th className="py-3 px-4">Akreditasi</th>
                        <th className="py-3 px-4 text-right">SKS</th>
                        <th className="py-3 px-5 text-right">Aksi</th>
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
                              <span className="ml-2 text-[11px] text-amber-700">(Disembunyikan)</span>
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
                                Sunting
                              </button>
                              {confirmDeleteId === prog.id ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await deleteProgram(prog.id);
                                    setConfirmDeleteId(null);
                                    showFeedback('success', 'Program studi telah dihapus.');
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-white bg-red-700 rounded-md cursor-pointer"
                                >
                                  Konfirmasi
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(prog.id)}
                                  aria-label={`Hapus ${prog.name}`}
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
                    Agenda &amp; Kalender Kampus
                  </h2>
                  <p className="text-xs text-[#4A5D54] mt-0.5">
                    Jadwalkan tenggat akademik, simposium ilmiah, MTQ mahasiswa, dan kegiatan kampus lainnya
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewAgenda}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Agenda
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
                        {evt.eventDate} · {evt.timeRange} · {agendaStatusLabel(evt.status)}
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
                        Sunting
                      </button>
                      {confirmDeleteId === evt.id ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteAgenda(evt.id);
                            setConfirmDeleteId(null);
                            showFeedback('success', 'Agenda kampus telah dihapus.');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-red-700 rounded-md cursor-pointer"
                        >
                          Konfirmasi
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(evt.id)}
                          aria-label={`Hapus ${evt.title}`}
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
                    Galeri Foto Kehidupan Kampus
                  </h2>
                  <p className="text-xs text-[#4A5D54] mt-0.5">
                    Unggah dokumentasi kampus, atur urutan karusel, dan kelola slide yang tampil di halaman utama
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewGalleryPhoto}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Unggah Foto Kampus
                </button>
              </div>

              {orderedGalleryPhotos.length === 0 ? (
                <div className="bg-white border border-[#E2E8E2] rounded-xl p-10 text-center">
                  <p className="text-sm text-[#4A5D54]">
                    Belum ada foto di galeri kampus. Unggah slide pertama Anda untuk mengisi karusel beranda.
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
                          <div className="text-xs text-[#4A5D54] mb-1">
                            <span className="font-semibold text-[#0E5A36]">
                              {galleryCategoryLabel(photo.category)}
                            </span>
                            <span aria-hidden="true"> · </span>
                            <span>{photo.photographer}</span>
                            <span aria-hidden="true"> · </span>
                            <span className={photo.active ? 'text-[#0E5A36] font-medium' : 'text-amber-700 font-medium'}>
                              {photo.active ? 'Tampil' : 'Disembunyikan'}
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
                            aria-label={`Pindahkan ${photo.title} ke atas`}
                            className="p-1.5 text-[#4A5D54] hover:text-[#0F1F18] hover:bg-white border border-transparent hover:border-[#D4DDD6] disabled:opacity-35 rounded-md cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === orderedGalleryPhotos.length - 1}
                            onClick={() => void reorderGalleryPhoto(photo.id, 'down')}
                            aria-label={`Pindahkan ${photo.title} ke bawah`}
                            className="p-1.5 text-[#4A5D54] hover:text-[#0F1F18] hover:bg-white border border-transparent hover:border-[#D4DDD6] disabled:opacity-35 rounded-md cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleGalleryPhotoActive(photo)}
                            aria-label={photo.active ? `Sembunyikan ${photo.title}` : `Tampilkan ${photo.title}`}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#4A5D54] hover:text-[#0F1F18] hover:bg-white border border-transparent hover:border-[#D4DDD6] rounded-md cursor-pointer"
                          >
                            {photo.active ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                Sembunyikan
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                Tampilkan
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
                            Sunting
                          </button>
                          {confirmDeleteId === photo.id ? (
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteGalleryPhoto(photo.id);
                                setConfirmDeleteId(null);
                                showFeedback('success', 'Foto telah dihapus dari galeri.');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md cursor-pointer"
                            >
                              Konfirmasi
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(photo.id)}
                              aria-label={`Hapus ${photo.title}`}
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
                    Testimoni Alumni
                  </h2>
                  <p className="text-xs text-[#4A5D54] mt-0.5">
                    Kelola kisah kiprah lulusan terverifikasi yang ditampilkan di beranda kampus
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewAlumni}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Testimoni
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
                        {item.program} · Angkatan {item.graduationYear}
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
                        {item.active ? 'Tampil di portal' : 'Disembunyikan'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditAlumni(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0F1F18] border border-[#D4DDD6] hover:bg-[#F2F5F1] rounded-md cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Sunting
                        </button>
                        {confirmDeleteId === item.id ? (
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteTestimonial(item.id);
                              setConfirmDeleteId(null);
                              showFeedback('success', 'Testimoni alumni telah dihapus.');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-red-700 rounded-md cursor-pointer"
                          >
                            Konfirmasi
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            aria-label={`Hapus ${item.name}`}
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
                  Notifikasi Kampus Real-Time
                </h2>
                <p className="text-xs text-[#4A5D54] mt-0.5">
                  Kirim pengumuman langsung yang muncul seketika di panel notifikasi pengunjung portal
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <form
                  onSubmit={submitBroadcast}
                  className="lg:col-span-5 bg-white border border-[#E2E8E2] rounded-xl p-6 space-y-4 h-fit"
                >
                  <h3 className="text-base font-semibold text-[#0F1F18]">
                    Buat Siaran Notifikasi
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                      Judul Notifikasi
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={140}
                      value={notifForm.title}
                      onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                      placeholder="Contoh: Perpanjangan Verifikasi Beasiswa"
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg focus:outline-none focus:border-[#0E5A36]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                      Isi Pesan
                    </label>
                    <textarea
                      required
                      rows={3}
                      maxLength={400}
                      value={notifForm.message}
                      onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                      placeholder="Tuliskan informasi penting, batas waktu, atau lokasi kegiatan..."
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg focus:outline-none focus:border-[#0E5A36]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                        Kategori Info
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
                        <option value="announcement">Pengumuman</option>
                        <option value="urgent">Info Penting</option>
                        <option value="agenda">Agenda</option>
                        <option value="news">Berita Kampus</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                        Bagian Tujuan
                      </label>
                      <select
                        value={notifForm.targetSection}
                        onChange={(e) =>
                          setNotifForm({ ...notifForm, targetSection: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white"
                      >
                        <option value="news">Berita &amp; Pengumuman</option>
                        <option value="agenda">Agenda Kampus</option>
                        <option value="programs">Program Studi</option>
                        <option value="campus-map">Peta Kampus</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] disabled:opacity-50 rounded-lg cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {busy ? 'Mengirim...' : 'Siarkan Notifikasi Sekarang'}
                  </button>
                </form>

                <div className="lg:col-span-7 bg-white border border-[#E2E8E2] rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E2E8E2]">
                    <h3 className="text-base font-semibold text-[#0F1F18]">
                      Daftar Siaran Aktif &amp; Arsip ({notifications.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-[#EDF1EE]">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-6 py-4 flex items-start justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="text-xs text-[#4A5D54] mb-0.5">
                            <span className="font-semibold text-[#0E5A36]">
                              {notifTypeLabel(notif.type)}
                            </span>
                            <span aria-hidden="true"> · </span>
                            <span>{notif.active ? 'Aktif' : 'Dijeda'}</span>
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
                            {notif.active ? 'Jeda' : 'Aktifkan'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteNotification(notif.id)}
                            aria-label={`Hapus ${notif.title}`}
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
                    Pengaturan Identitas &amp; Profil Situs
                  </h2>
                  <p className="text-xs text-[#4A5D54] mt-0.5">
                    Perubahan langsung memperbarui beranda portal publik STAI Al-Furqan Makassar
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] disabled:opacity-50 rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {busy ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>

              <div className="bg-white border border-[#E2E8E2] rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-[#0F1F18]">Hero &amp; Penerimaan Mahasiswa Baru</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                      Nama Institusi
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
                      Label Spanduk PMB
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
                    Judul Utama Beranda
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
                    Subjudul Beranda
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
                  Tampilkan baris informasi pendaftaran PMB aktif pada bagian Hero
                </label>
              </div>

              <div className="bg-white border border-[#E2E8E2] rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-[#0F1F18]">
                  Visi, Misi &amp; Pimpinan Institusi
                </h3>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Visi</label>
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
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Misi</label>
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
                      Nama Ketua / Pimpinan
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
                      Jabatan Pimpinan
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
                    Sambutan Ketua
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
                <h3 className="text-sm font-semibold text-[#0F1F18]">Informasi Kontak</h3>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Alamat Kampus
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
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">Telepon</label>
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
                    Profil Media Sosial Resmi
                  </h3>
                  <p className="text-xs text-[#4A5D54] mt-0.5">
                    Atur tautan kanal media sosial resmi di footer situs. Kosongkan kolom untuk
                    menyembunyikan platform tersebut dari footer publik.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                      URL Instagram
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
                      URL Facebook
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
                      URL Twitter / X
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
                      URL YouTube
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
                {editingPost ? 'Sunting Publikasi' : 'Berita / Artikel / Pengumuman Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setPostModalOpen(false)}
                aria-label="Tutup editor publikasi"
                className="p-1.5 text-[#4A5D54] hover:text-[#0F1F18] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">Judul</label>
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
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Kategori</label>
                  <select
                    value={postForm.category}
                    onChange={(e) =>
                      setPostForm({ ...postForm, category: e.target.value as PostCategory })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white"
                  >
                    <option value="news">Berita Kampus</option>
                    <option value="article">Artikel Ilmiah</option>
                    <option value="announcement">Pengumuman</option>
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
                    <option value="published">Terbit</option>
                    <option value="draft">Draf</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Prioritas</label>
                  <select
                    value={postForm.priority}
                    onChange={(e) =>
                      setPostForm({ ...postForm, priority: e.target.value as PostPriority })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Penting</option>
                    <option value="urgent">Mendesak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Penulis</label>
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
                    Tanggal Terbit
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
                  Foto Sampul
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
                  Ringkasan Singkat (10–400 karakter)
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
                  Isi Publikasi (pisahkan paragraf dengan baris kosong)
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
                  Kirim notifikasi kampus real-time saat diterbitkan
                </label>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8E2] bg-[#FAFBF9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPostModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#4A5D54] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] disabled:opacity-50 rounded-lg cursor-pointer"
              >
                {busy ? 'Menyimpan...' : 'Simpan Publikasi'}
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
                {editingProgram ? 'Sunting Program Studi' : 'Tambah Program Studi'}
              </h3>
              <button
                type="button"
                onClick={() => setProgramModalOpen(false)}
                aria-label="Tutup editor program studi"
                className="p-1.5 text-[#4A5D54] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Kode</label>
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
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Jenjang</label>
                  <select
                    value={programForm.degree}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, degree: e.target.value as DegreeLevel })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white"
                  >
                    <option value="S1">Sarjana (S1)</option>
                    <option value="S2">Pascasarjana (S2)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">Nama Program Studi</label>
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
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Fakultas</label>
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
                    Akreditasi
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
                    Beban SKS
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
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">Masa Studi</label>
                <input
                  type="text"
                  required
                  value={programForm.duration}
                  onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">Ringkasan Akademik</label>
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
                  Prospek Karier Lulusan
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
                Tampilkan di portal publik
              </label>
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8E2] bg-[#FAFBF9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setProgramModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#4A5D54] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg cursor-pointer"
              >
                {busy ? 'Menyimpan...' : 'Simpan Program'}
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
                {editingAgenda ? 'Sunting Agenda Kampus' : 'Tambah Agenda Kampus'}
              </h3>
              <button
                type="button"
                onClick={() => setAgendaModalOpen(false)}
                aria-label="Tutup editor agenda"
                className="p-1.5 text-[#4A5D54] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">Judul Kegiatan</label>
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
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={agendaForm.eventDate}
                    onChange={(e) => setAgendaForm({ ...agendaForm, eventDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Waktu</label>
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
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Lokasi</label>
                  <input
                    type="text"
                    required
                    value={agendaForm.location}
                    onChange={(e) => setAgendaForm({ ...agendaForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Penyelenggara</label>
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
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Kategori</label>
                  <select
                    value={agendaForm.category}
                    onChange={(e) =>
                      setAgendaForm({ ...agendaForm, category: e.target.value as AgendaCategory })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg bg-white"
                  >
                    <option value="academic">Akademik</option>
                    <option value="admissions">Penerimaan (PMB)</option>
                    <option value="seminar">Seminar &amp; Simposium</option>
                    <option value="student-life">Kemahasiswaan</option>
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
                    <option value="upcoming">Akan Datang</option>
                    <option value="ongoing">Berlangsung</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">Deskripsi</label>
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
                  Siarkan notifikasi agenda secara real-time
                </label>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8E2] bg-[#FAFBF9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAgendaModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#4A5D54] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg cursor-pointer"
              >
                {busy ? 'Menyimpan...' : 'Simpan Agenda'}
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
                {editingAlumni ? 'Sunting Testimoni Alumni' : 'Tambah Testimoni Alumni'}
              </h3>
              <button
                type="button"
                onClick={() => setAlumniModalOpen(false)}
                aria-label="Tutup editor testimoni"
                className="p-1.5 text-[#4A5D54] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Nama Lengkap</label>
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
                    Tahun Lulus
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
                  Program Studi
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
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Jabatan / Profesi</label>
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
                    Instansi / Lembaga
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
                  Kutipan Testimoni
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
                Batal
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg cursor-pointer"
              >
                {busy ? 'Menyimpan...' : 'Simpan Testimoni'}
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
                {editingPhoto ? 'Sunting Slide Galeri Kampus' : 'Unggah Foto Kehidupan Kampus'}
              </h3>
              <button
                type="button"
                onClick={() => setGalleryModalOpen(false)}
                aria-label="Tutup editor galeri"
                className="p-1.5 text-[#4A5D54] hover:text-[#0F1F18] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* Image Source Selector */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-medium text-[#0F1F18]">Sumber Foto</label>
                  <div className="inline-flex items-center gap-1 p-0.5 bg-[#F2F5F1] border border-[#D4DDD6] rounded-md">
                    {(
                      [
                        ['upload', 'Unggah Berkas'],
                        ['preset', 'Foto Kampus'],
                        ['url', 'Tautan URL'],
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
                        ? 'Mengoptimalkan gambar untuk pemuatan cepat...'
                        : 'Seret dan lepas foto kampus di sini, atau pilih dari perangkat Anda'}
                    </div>
                    <p className="text-[11px] text-[#6B7D74] mt-1">
                      JPG, PNG, atau WebP · Ukuran otomatis dioptimalkan untuk karusel web yang cepat
                    </p>
                    <button
                      type="button"
                      disabled={galleryUploadBusy}
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="mt-3 px-4 py-1.5 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] disabled:opacity-50 rounded-lg cursor-pointer"
                    >
                      {galleryUploadBusy ? 'Memproses...' : 'Pilih Berkas Gambar'}
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
                      placeholder="https://contoh.ac.id/foto/pelataran-kampus.jpg"
                      value={galleryForm.imageUrl.startsWith('data:') ? '' : galleryForm.imageUrl}
                      onChange={(e) =>
                        setGalleryForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                    />
                    <p className="text-[11px] text-[#6B7D74] mt-1">
                      Masukkan URL gambar HTTPS dari dokumentasi resmi kampus.
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
                        alt={galleryForm.title || 'Pratinjau foto kampus'}
                        className="w-full h-full object-cover"
                        fallbackTitle="Pratinjau Foto"
                      />
                    </div>
                    <div className="px-3 py-1.5 text-[11px] text-[#4A5D54] flex items-center justify-between">
                      <span>
                        {galleryForm.imageUrl.startsWith('data:image/')
                          ? `Foto siap diunggah (${Math.round(galleryForm.imageUrl.length / 1024)} KB terkompresi)`
                          : 'Pratinjau dimuat'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGalleryForm((prev) => ({ ...prev, imageUrl: '' }))}
                        className="text-red-700 hover:underline cursor-pointer"
                      >
                        Hapus gambar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                  Judul Foto (3–140 karakter)
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={140}
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="Contoh: Diskusi Pagi di Pelataran Kampus Daya"
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                  Keterangan Foto (5–320 karakter)
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={5}
                  maxLength={320}
                  value={galleryForm.caption}
                  onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                  placeholder="Jelaskan suasana kampus, kegiatan mahasiswa, atau momen akademik..."
                  className="w-full px-3 py-2 text-sm border border-[#D4DDD6] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">Kategori</label>
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
                    <option value="campus">Lingkungan Kampus</option>
                    <option value="academics">Akademik</option>
                    <option value="student-life">Kemahasiswaan</option>
                    <option value="events">Kegiatan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1F18] mb-1">
                    Fotografer / Kredit
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
                    Urutan Slide
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
                Tampilkan foto ini pada karusel galeri halaman utama
              </label>
            </div>

            <div className="px-6 py-4 border-t border-[#E2E8E2] bg-[#FAFBF9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setGalleryModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#4A5D54] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={busy || galleryUploadBusy}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] disabled:opacity-50 rounded-lg cursor-pointer"
              >
                {busy ? 'Menyimpan...' : editingPhoto ? 'Perbarui Slide' : 'Terbitkan ke Karusel'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
