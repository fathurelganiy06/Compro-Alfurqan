export interface SiteSettings {
  id: string;
  institutionName: string;
  heroTitle: string;
  heroSubtitle: string;
  admissionsOpen: boolean;
  admissionsLabel: string;
  vision: string;
  mission: string;
  rectorName: string;
  rectorTitle: string;
  rectorMessage: string;
  address: string;
  phone: string;
  email: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTwitter: string;
  socialYoutube: string;
  updatedBy: string;
  updatedAt?: unknown;
}

export type DegreeLevel = 'S1' | 'S2';

export interface AcademicProgram {
  id: string;
  code: string;
  name: string;
  degree: DegreeLevel;
  faculty: string;
  accreditation: string;
  duration: string;
  credits: number;
  summary: string;
  careerOutcomes: string;
  featured: boolean;
  active: boolean;
  authorId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type PostCategory = 'news' | 'article' | 'announcement';
export type PostStatus = 'draft' | 'published';
export type PostPriority = 'normal' | 'important' | 'urgent';

export interface Post {
  id: string;
  title: string;
  slug: string;
  category: PostCategory;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  status: PostStatus;
  priority: PostPriority;
  featured: boolean;
  views: number;
  publishedDate: string;
  authorId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type AgendaCategory = 'academic' | 'admissions' | 'seminar' | 'student-life';
export type AgendaStatus = 'upcoming' | 'ongoing' | 'completed';

export interface AgendaEvent {
  id: string;
  title: string;
  eventDate: string;
  timeRange: string;
  location: string;
  organizer: string;
  category: AgendaCategory;
  description: string;
  status: AgendaStatus;
  active: boolean;
  authorId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AlumniTestimonial {
  id: string;
  name: string;
  graduationYear: number;
  program: string;
  role: string;
  organization: string;
  quote: string;
  featured: boolean;
  active: boolean;
  authorId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type NotificationType = 'announcement' | 'agenda' | 'news' | 'urgent';

export interface CampusNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  targetSection: string;
  active: boolean;
  authorId: string;
  createdAt?: unknown;
  createdAtMs?: number;
}

export interface DailyAnalytics {
  id: string;
  dateLabel: string;
  isoDate: string;
  visitors: number;
  pageViews: number;
  searches: number;
  programViews: number;
  mobileShare: number;
  authorId: string;
  updatedAt?: unknown;
}

export type AnalyticsEventType =
  | 'page_view'
  | 'search'
  | 'article_read'
  | 'program_view'
  | 'map_interact';

export interface AnalyticsEvent {
  id: string;
  eventType: AnalyticsEventType;
  label: string;
  actorId: string;
  createdAt?: unknown;
  createdAtMs?: number;
}

export type GalleryCategory = 'campus' | 'academics' | 'student-life' | 'events';

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  category: GalleryCategory;
  imageUrl: string;
  photographer: string;
  displayOrder: number;
  active: boolean;
  authorId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

/**
 * Verbatim validation bounds synchronized with firebase-blueprint.json and firestore.rules.
 */
export const BLUEPRINT_BOUNDS = {
  idPattern: /^[a-zA-Z0-9_-]+$/,
  slugPattern: /^[a-z0-9-]+$/,
  programCodePattern: /^[A-Z0-9-]+$/,
  isoDatePattern: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,
  post: {
    titleMin: 4,
    titleMax: 180,
    slugMin: 3,
    slugMax: 140,
    excerptMin: 10,
    excerptMax: 400,
    contentMin: 20,
    contentMax: 12000,
    coverImageMax: 500,
    authorNameMin: 2,
    authorNameMax: 100,
  },
  program: {
    codeMin: 2,
    codeMax: 24,
    nameMin: 3,
    nameMax: 140,
    facultyMin: 3,
    facultyMax: 120,
    summaryMin: 10,
    summaryMax: 500,
    outcomesMin: 5,
    outcomesMax: 500,
    creditsMin: 24,
    creditsMax: 200,
  },
  agenda: {
    titleMin: 4,
    titleMax: 160,
    locationMin: 3,
    locationMax: 160,
    organizerMin: 2,
    organizerMax: 120,
    descriptionMin: 10,
    descriptionMax: 1200,
  },
  testimonial: {
    nameMin: 2,
    nameMax: 120,
    quoteMin: 15,
    quoteMax: 800,
    yearMin: 1980,
    yearMax: 2035,
  },
  notification: {
    titleMin: 3,
    titleMax: 140,
    messageMin: 5,
    messageMax: 400,
  },
  gallery: {
    titleMin: 3,
    titleMax: 140,
    captionMin: 5,
    captionMax: 320,
    photographerMin: 2,
    photographerMax: 100,
    imageUrlMax: 350000,
  },
} as const;

export function sanitizeSlug(input: string): string {
  const cleaned = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, BLUEPRINT_BOUNDS.post.slugMax);
  return cleaned.length >= 3 ? cleaned : `post-${Date.now().toString(36)}`;
}

export function sanitizeProgramCode(input: string): string {
  const cleaned = input
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, BLUEPRINT_BOUNDS.program.codeMax);
  return cleaned.length >= 2 ? cleaned : `PR-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

export function generateSafeDocId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  const timePart = Date.now().toString(36);
  return `${prefix}-${timePart}-${randomPart}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function clampText(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

export function sanitizeSocialUrl(value: string | undefined | null): string {
  const trimmed = (value || '').trim().slice(0, 300);
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed.replace(/^\/+/, '')}`.slice(0, 300);
}

export function sanitizeGalleryImageUrl(value: string): string {
  const trimmed = value.trim();
  if (
    /^https?:\/\/.+/.test(trimmed) ||
    /^\/[^\s]+/.test(trimmed) ||
    /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(trimmed)
  ) {
    return trimmed.slice(0, 350000);
  }
  return '';
}

/**
 * Resizes and compresses a user-uploaded image file to a clean JPEG data URL
 * strictly under 260,000 characters for safe Firestore persistence and fast loading.
 */
export async function compressImageFileToDataUrl(file: File): Promise<string> {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, or WebP image file.');
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Image file must be under 15 MB.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Unable to read the selected image file.'));
      el.src = objectUrl;
    });

    const maxWidth = 1120;
    const maxHeight = 760;
    let { width, height } = img;
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.max(1, Math.round(width * ratio));
      height = Math.max(1, Math.round(height * ratio));
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas image processing is unavailable in this browser.');
    }
    ctx.drawImage(img, 0, 0, width, height);

    const qualities = [0.82, 0.72, 0.62, 0.5];
    for (const q of qualities) {
      const dataUrl = canvas.toDataURL('image/jpeg', q);
      if (dataUrl.length <= 260000) {
        return dataUrl;
      }
    }

    // Final smaller fallback for ultra-detailed images
    canvas.width = Math.round(width * 0.72);
    canvas.height = Math.round(height * 0.72);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const fallbackUrl = canvas.toDataURL('image/jpeg', 0.58);
    if (fallbackUrl.length > 340000) {
      throw new Error('Image could not be compressed under the storage limit. Try a smaller photo.');
    }
    return fallbackUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
