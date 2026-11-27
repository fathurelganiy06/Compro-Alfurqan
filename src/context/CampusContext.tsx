import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  DEFAULT_AGENDA,
  DEFAULT_DAILY_ANALYTICS,
  DEFAULT_GALLERY_PHOTOS,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_POSTS,
  DEFAULT_PROGRAMS,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_TESTIMONIALS,
} from '../data/defaultCampusData';
import {
  BLUEPRINT_BOUNDS,
  clampText,
  generateSafeDocId,
  sanitizeGalleryImageUrl,
  sanitizeProgramCode,
  sanitizeSlug,
  sanitizeSocialUrl,
  type AcademicProgram,
  type AgendaEvent,
  type AlumniTestimonial,
  type AnalyticsEvent,
  type AnalyticsEventType,
  type CampusNotification,
  type DailyAnalytics,
  type GalleryPhoto,
  type Post,
  type SiteSettings,
} from '../types/cms';

export interface SessionTelemetry {
  pageViews: number;
  searches: number;
  articleReads: number;
  programViews: number;
  mapInteractions: number;
  recentEvents: { id: string; eventType: AnalyticsEventType; label: string; timestamp: number }[];
}

interface DemoCmsStore {
  siteSettings?: SiteSettings;
  programs?: AcademicProgram[];
  posts?: Post[];
  agenda?: AgendaEvent[];
  testimonials?: AlumniTestimonial[];
  galleryPhotos?: GalleryPhoto[];
  notifications?: CampusNotification[];
  dailyAnalytics?: DailyAnalytics[];
}

interface CampusContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  isDemoMode: boolean;
  isCloudSynced: boolean;
  authError: string | null;
  signInAdmin: () => Promise<void>;
  signOutUser: () => Promise<void>;
  resetDemoData: () => void;

  siteSettings: SiteSettings;
  programs: AcademicProgram[];
  posts: Post[];
  agenda: AgendaEvent[];
  testimonials: AlumniTestimonial[];
  galleryPhotos: GalleryPhoto[];
  notifications: CampusNotification[];
  dailyAnalytics: DailyAnalytics[];
  analyticsEvents: AnalyticsEvent[];
  sessionTelemetry: SessionTelemetry;

  isFirestoreSeeded: boolean;
  isLoadingData: boolean;
  isSeeding: boolean;
  unreadNotificationCount: number;
  latestLiveNotification: CampusNotification | null;
  dismissLiveToast: () => void;
  markAllNotificationsRead: () => void;

  seedInitialDatabase: () => Promise<void>;
  saveSiteSettings: (data: Omit<SiteSettings, 'id' | 'updatedBy' | 'updatedAt'>) => Promise<void>;
  saveProgram: (
    data: Omit<AcademicProgram, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>,
    existing?: AcademicProgram | null,
  ) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  savePost: (
    data: Omit<Post, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>,
    existing?: Post | null,
    alsoNotify?: boolean,
  ) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  saveAgenda: (
    data: Omit<AgendaEvent, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>,
    existing?: AgendaEvent | null,
    alsoNotify?: boolean,
  ) => Promise<void>;
  deleteAgenda: (id: string) => Promise<void>;
  saveTestimonial: (
    data: Omit<AlumniTestimonial, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>,
    existing?: AlumniTestimonial | null,
  ) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  saveGalleryPhoto: (
    data: Omit<GalleryPhoto, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>,
    existing?: GalleryPhoto | null,
  ) => Promise<void>;
  deleteGalleryPhoto: (id: string) => Promise<void>;
  toggleGalleryPhotoActive: (photo: GalleryPhoto) => Promise<void>;
  reorderGalleryPhoto: (photoId: string, direction: 'up' | 'down') => Promise<void>;
  broadcastNotification: (data: {
    title: string;
    message: string;
    type: CampusNotification['type'];
    targetSection: string;
  }) => Promise<void>;
  toggleNotificationActive: (notif: CampusNotification) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  recordDailyAnalytics: (data: Omit<DailyAnalytics, 'id' | 'authorId' | 'updatedAt'>) => Promise<void>;
  trackInteraction: (eventType: AnalyticsEventType, label: string) => void;
  incrementPostView: (post: Post) => void;
}

const CampusContext = createContext<CampusContextValue | null>(null);

const READ_NOTIFS_KEY = 'stai_alfurqan_read_notifs_v1';
const SESSION_TELEMETRY_KEY = 'stai_alfurqan_session_telemetry_v1';
const DEMO_CMS_STORAGE_KEY = 'stai_alfurqan_demo_cms_v1';
const DEMO_ACTOR_ID = 'demo-admin';

function extractMillis(ts: unknown, fallback = 0): number {
  if (ts instanceof Timestamp) return ts.toMillis();
  if (ts && typeof ts === 'object' && 'toMillis' in ts && typeof (ts as { toMillis: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  return fallback;
}

function loadReadIds(): string[] {
  try {
    const raw = localStorage.getItem(READ_NOTIFS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function loadSessionTelemetry(): SessionTelemetry {
  try {
    const raw = localStorage.getItem(SESSION_TELEMETRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.pageViews === 'number') {
        return parsed as SessionTelemetry;
      }
    }
  } catch {
    // ignore
  }
  return {
    pageViews: 1,
    searches: 0,
    articleReads: 0,
    programViews: 0,
    mapInteractions: 0,
    recentEvents: [],
  };
}

function loadDemoStore(): DemoCmsStore {
  try {
    const raw = localStorage.getItem(DEMO_CMS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as DemoCmsStore) : {};
  } catch {
    return {};
  }
}

function persistDemoStore(store: DemoCmsStore): void {
  try {
    localStorage.setItem(DEMO_CMS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore localStorage quota limits (e.g., multiple large base64 uploads); state remains live in memory.
  }
}

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isCloudAdmin, setIsCloudAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [cloudSiteSettings, setCloudSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [cloudPrograms, setCloudPrograms] = useState<AcademicProgram[]>(DEFAULT_PROGRAMS);
  const [cloudPosts, setCloudPosts] = useState<Post[]>(DEFAULT_POSTS);
  const [cloudAgenda, setCloudAgenda] = useState<AgendaEvent[]>(DEFAULT_AGENDA);
  const [cloudTestimonials, setCloudTestimonials] = useState<AlumniTestimonial[]>(DEFAULT_TESTIMONIALS);
  const [cloudGalleryPhotos, setCloudGalleryPhotos] = useState<GalleryPhoto[]>(DEFAULT_GALLERY_PHOTOS);
  const [cloudNotifications, setCloudNotifications] = useState<CampusNotification[]>(DEFAULT_NOTIFICATIONS);
  const [cloudDailyAnalytics, setCloudDailyAnalytics] = useState<DailyAnalytics[]>(DEFAULT_DAILY_ANALYTICS);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [sessionTelemetry, setSessionTelemetry] = useState<SessionTelemetry>(loadSessionTelemetry);

  // Local demo CMS store used whenever credentials are bypassed (no Google sign-in required)
  const [demoStore, setDemoStore] = useState<DemoCmsStore>(loadDemoStore);

  const [isFirestoreSeeded, setIsFirestoreSeeded] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const [readNotifIds, setReadNotifIds] = useState<string[]>(loadReadIds);
  const [latestLiveNotification, setLatestLiveNotification] = useState<CampusNotification | null>(null);
  const knownNotifIdsRef = useRef<Set<string>>(new Set());
  const initialNotifLoadedRef = useRef(false);
  const hasGalleryDocsRef = useRef(false);

  const isDemoMode = !isCloudAdmin;

  const updateDemoStore = useCallback((updater: (prev: DemoCmsStore) => DemoCmsStore) => {
    setDemoStore((prev) => {
      const next = updater(prev);
      persistDemoStore(next);
      return next;
    });
  }, []);

  const resetDemoData = useCallback(() => {
    setDemoStore({});
    try {
      localStorage.removeItem(DEMO_CMS_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Derived active state: live Firestore when signed in as verified cloud admin, or demo store over cloud defaults
  const siteSettings = useMemo(
    () => (isCloudAdmin ? cloudSiteSettings : demoStore.siteSettings ?? cloudSiteSettings),
    [isCloudAdmin, cloudSiteSettings, demoStore.siteSettings],
  );
  const programs = useMemo(
    () => (isCloudAdmin ? cloudPrograms : demoStore.programs ?? cloudPrograms),
    [isCloudAdmin, cloudPrograms, demoStore.programs],
  );
  const posts = useMemo(
    () => (isCloudAdmin ? cloudPosts : demoStore.posts ?? cloudPosts),
    [isCloudAdmin, cloudPosts, demoStore.posts],
  );
  const agenda = useMemo(
    () => (isCloudAdmin ? cloudAgenda : demoStore.agenda ?? cloudAgenda),
    [isCloudAdmin, cloudAgenda, demoStore.agenda],
  );
  const testimonials = useMemo(
    () => (isCloudAdmin ? cloudTestimonials : demoStore.testimonials ?? cloudTestimonials),
    [isCloudAdmin, cloudTestimonials, demoStore.testimonials],
  );
  const galleryPhotos = useMemo(
    () => (isCloudAdmin ? cloudGalleryPhotos : demoStore.galleryPhotos ?? cloudGalleryPhotos),
    [isCloudAdmin, cloudGalleryPhotos, demoStore.galleryPhotos],
  );
  const notifications = useMemo(
    () => (isCloudAdmin ? cloudNotifications : demoStore.notifications ?? cloudNotifications),
    [isCloudAdmin, cloudNotifications, demoStore.notifications],
  );
  const dailyAnalytics = useMemo(
    () => (isCloudAdmin ? cloudDailyAnalytics : demoStore.dailyAnalytics ?? cloudDailyAnalytics),
    [isCloudAdmin, cloudDailyAnalytics, demoStore.dailyAnalytics],
  );

  // 1. Optional Auth & Cloud Admin Verification (non-blocking for demo CMS)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthError(null);
      if (!firebaseUser) {
        setIsCloudAdmin(false);
        setAuthReady(true);
        return;
      }
      if (firebaseUser.emailVerified && firebaseUser.email === BOOTSTRAPPED_ADMIN_EMAIL) {
        setIsCloudAdmin(true);
        setAuthReady(true);
        return;
      }
      try {
        const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
        setIsCloudAdmin(firebaseUser.emailVerified && adminSnap.exists());
      } catch {
        setIsCloudAdmin(false);
      } finally {
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, []);

  // 2. Real-Time Firestore Listeners (public read queries when unauthenticated; full admin queries when cloud-authenticated)
  useEffect(() => {
    if (!authReady) return;
    setIsLoadingData(true);

    const unsubs: (() => void)[] = [];

    // Site settings single document
    unsubs.push(
      onSnapshot(
        doc(db, 'site_settings', 'main'),
        (snap) => {
          if (snap.exists()) {
            const raw = snap.data() as Partial<SiteSettings>;
            setCloudSiteSettings({
              ...DEFAULT_SITE_SETTINGS,
              ...raw,
              id: snap.id,
              socialInstagram: raw.socialInstagram ?? DEFAULT_SITE_SETTINGS.socialInstagram,
              socialFacebook: raw.socialFacebook ?? DEFAULT_SITE_SETTINGS.socialFacebook,
              socialTwitter: raw.socialTwitter ?? DEFAULT_SITE_SETTINGS.socialTwitter,
              socialYoutube: raw.socialYoutube ?? DEFAULT_SITE_SETTINGS.socialYoutube,
            });
            setIsFirestoreSeeded(true);
          } else {
            setCloudSiteSettings(DEFAULT_SITE_SETTINGS);
            setIsFirestoreSeeded(false);
          }
          setIsLoadingData(false);
        },
        (error) => {
          setIsLoadingData(false);
          handleFirestoreError(error, OperationType.GET, 'site_settings/main');
        },
      ),
    );

    // Programs
    const programsRef = isCloudAdmin
      ? collection(db, 'programs')
      : query(collection(db, 'programs'), where('active', '==', true));
    unsubs.push(
      onSnapshot(
        programsRef,
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs
              .map((d) => ({ id: d.id, ...(d.data() as Omit<AcademicProgram, 'id'>) }))
              .sort((a, b) => (a.degree === b.degree ? a.name.localeCompare(b.name) : a.degree === 'S2' ? -1 : 1));
            setCloudPrograms(list);
          } else {
            setCloudPrograms(DEFAULT_PROGRAMS);
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'programs'),
      ),
    );

    // Posts (news, articles, announcements)
    const postsRef = isCloudAdmin
      ? collection(db, 'posts')
      : query(collection(db, 'posts'), where('status', '==', 'published'));
    unsubs.push(
      onSnapshot(
        postsRef,
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs
              .map((d) => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) }))
              .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
            setCloudPosts(list);
          } else {
            setCloudPosts(DEFAULT_POSTS);
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'posts'),
      ),
    );

    // Agenda
    const agendaRef = isCloudAdmin
      ? collection(db, 'agenda')
      : query(collection(db, 'agenda'), where('active', '==', true));
    unsubs.push(
      onSnapshot(
        agendaRef,
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs
              .map((d) => ({ id: d.id, ...(d.data() as Omit<AgendaEvent, 'id'>) }))
              .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
            setCloudAgenda(list);
          } else {
            setCloudAgenda(DEFAULT_AGENDA);
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'agenda'),
      ),
    );

    // Testimonials
    const testimonialsRef = isCloudAdmin
      ? collection(db, 'testimonials')
      : query(collection(db, 'testimonials'), where('active', '==', true));
    unsubs.push(
      onSnapshot(
        testimonialsRef,
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs
              .map((d) => ({ id: d.id, ...(d.data() as Omit<AlumniTestimonial, 'id'>) }))
              .sort((a, b) => b.graduationYear - a.graduationYear);
            setCloudTestimonials(list);
          } else {
            setCloudTestimonials(DEFAULT_TESTIMONIALS);
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'testimonials'),
      ),
    );

    // Campus Life Gallery Photos
    const galleryRef = isCloudAdmin
      ? collection(db, 'gallery_photos')
      : query(collection(db, 'gallery_photos'), where('active', '==', true));
    unsubs.push(
      onSnapshot(
        galleryRef,
        (snap) => {
          if (!snap.empty) {
            hasGalleryDocsRef.current = true;
            const list = snap.docs
              .map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryPhoto, 'id'>) }))
              .sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title));
            setCloudGalleryPhotos(list);
          } else {
            hasGalleryDocsRef.current = false;
            setCloudGalleryPhotos(DEFAULT_GALLERY_PHOTOS);
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'gallery_photos'),
      ),
    );

    // Real-time Notifications
    const notifRef = isCloudAdmin
      ? collection(db, 'notifications')
      : query(collection(db, 'notifications'), where('active', '==', true));
    unsubs.push(
      onSnapshot(
        notifRef,
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs
              .map((d) => {
                const raw = d.data() as Omit<CampusNotification, 'id'>;
                return {
                  id: d.id,
                  ...raw,
                  createdAtMs: extractMillis(raw.createdAt, Date.now()),
                };
              })
              .sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));

            if (initialNotifLoadedRef.current) {
              const newlyArrived = list.find((n) => n.active && !knownNotifIdsRef.current.has(n.id));
              if (newlyArrived) {
                setLatestLiveNotification(newlyArrived);
              }
            }
            list.forEach((n) => knownNotifIdsRef.current.add(n.id));
            initialNotifLoadedRef.current = true;
            setCloudNotifications(list);
          } else {
            DEFAULT_NOTIFICATIONS.forEach((n) => knownNotifIdsRef.current.add(n.id));
            initialNotifLoadedRef.current = true;
            setCloudNotifications(DEFAULT_NOTIFICATIONS);
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'notifications'),
      ),
    );

    // Cloud-admin-only Analytics listeners
    if (isCloudAdmin && user) {
      unsubs.push(
        onSnapshot(
          collection(db, 'analytics_daily'),
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs
                .map((d) => ({ id: d.id, ...(d.data() as Omit<DailyAnalytics, 'id'>) }))
                .sort((a, b) => a.isoDate.localeCompare(b.isoDate));
              setCloudDailyAnalytics(list);
            } else {
              setCloudDailyAnalytics(DEFAULT_DAILY_ANALYTICS);
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'analytics_daily'),
        ),
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'analytics_events'),
          (snap) => {
            const list = snap.docs
              .map((d) => {
                const raw = d.data() as Omit<AnalyticsEvent, 'id'>;
                return {
                  id: d.id,
                  ...raw,
                  createdAtMs: extractMillis(raw.createdAt, Date.now()),
                };
              })
              .sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0))
              .slice(0, 50);
            setAnalyticsEvents(list);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'analytics_events'),
        ),
      );
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [authReady, isCloudAdmin, user]);

  // Auto-dismiss live notification toast after 7 seconds
  useEffect(() => {
    if (!latestLiveNotification) return;
    const timer = window.setTimeout(() => setLatestLiveNotification(null), 7000);
    return () => window.clearTimeout(timer);
  }, [latestLiveNotification]);

  const signInAdmin = useCallback(async () => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (!cred.user.emailVerified) {
        setAuthError('Your Google account email must be verified to sync with Firestore.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to complete Google sign-in.';
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError(msg);
      }
    }
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const seedInitialDatabase = useCallback(async () => {
    if (!user || !isCloudAdmin) return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      const now = serverTimestamp();

      const { id: _settingsId, updatedAt: _u, ...settingsBody } = DEFAULT_SITE_SETTINGS;
      batch.set(doc(db, 'site_settings', 'main'), {
        ...settingsBody,
        updatedBy: user.uid,
        updatedAt: now,
      });

      for (const prog of DEFAULT_PROGRAMS) {
        const { id, createdAt: _c, updatedAt: _up, ...body } = prog;
        batch.set(doc(db, 'programs', id), {
          ...body,
          authorId: user.uid,
          createdAt: now,
          updatedAt: now,
        });
      }

      for (const post of DEFAULT_POSTS) {
        const { id, createdAt: _c, updatedAt: _up, ...body } = post;
        batch.set(doc(db, 'posts', id), {
          ...body,
          authorId: user.uid,
          createdAt: now,
          updatedAt: now,
        });
      }

      for (const evt of DEFAULT_AGENDA) {
        const { id, createdAt: _c, updatedAt: _up, ...body } = evt;
        batch.set(doc(db, 'agenda', id), {
          ...body,
          authorId: user.uid,
          createdAt: now,
          updatedAt: now,
        });
      }

      for (const item of DEFAULT_TESTIMONIALS) {
        const { id, createdAt: _c, updatedAt: _up, ...body } = item;
        batch.set(doc(db, 'testimonials', id), {
          ...body,
          authorId: user.uid,
          createdAt: now,
          updatedAt: now,
        });
      }

      for (const notif of DEFAULT_NOTIFICATIONS) {
        const { id, createdAt: _c, createdAtMs: _ms, ...body } = notif;
        batch.set(doc(db, 'notifications', id), {
          ...body,
          authorId: user.uid,
          createdAt: now,
        });
      }

      for (const day of DEFAULT_DAILY_ANALYTICS) {
        const { id, updatedAt: _up, ...body } = day;
        batch.set(doc(db, 'analytics_daily', id), {
          ...body,
          authorId: user.uid,
          updatedAt: now,
        });
      }

      for (const photo of DEFAULT_GALLERY_PHOTOS) {
        const { id, createdAt: _c, updatedAt: _up, ...body } = photo;
        batch.set(doc(db, 'gallery_photos', id), {
          ...body,
          authorId: user.uid,
          createdAt: now,
          updatedAt: now,
        });
      }

      await batch.commit();
      setIsFirestoreSeeded(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch-seed');
    } finally {
      setIsSeeding(false);
    }
  }, [user, isCloudAdmin]);

  // Auto-seed once when verified cloud admin first signs in to an empty Firestore DB
  const autoSeedTriggeredRef = useRef(false);
  useEffect(() => {
    if (authReady && isCloudAdmin && user && !isLoadingData && !isFirestoreSeeded && !isSeeding && !autoSeedTriggeredRef.current) {
      autoSeedTriggeredRef.current = true;
      void seedInitialDatabase();
    }
  }, [authReady, isCloudAdmin, user, isLoadingData, isFirestoreSeeded, isSeeding, seedInitialDatabase]);

  const saveSiteSettings = useCallback(
    async (data: Omit<SiteSettings, 'id' | 'updatedBy' | 'updatedAt'>) => {
      const sanitized = {
        institutionName: clampText(data.institutionName, 120),
        heroTitle: clampText(data.heroTitle, 180),
        heroSubtitle: clampText(data.heroSubtitle, 400),
        admissionsOpen: Boolean(data.admissionsOpen),
        admissionsLabel: clampText(data.admissionsLabel, 120),
        vision: clampText(data.vision, 600),
        mission: clampText(data.mission, 1200),
        rectorName: clampText(data.rectorName, 120),
        rectorTitle: clampText(data.rectorTitle, 120),
        rectorMessage: clampText(data.rectorMessage, 1000),
        address: clampText(data.address, 300),
        phone: clampText(data.phone, 40),
        email: clampText(data.email, 120),
        socialInstagram: sanitizeSocialUrl(data.socialInstagram),
        socialFacebook: sanitizeSocialUrl(data.socialFacebook),
        socialTwitter: sanitizeSocialUrl(data.socialTwitter),
        socialYoutube: sanitizeSocialUrl(data.socialYoutube),
      };

      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => ({
          ...prev,
          siteSettings: {
            id: 'main',
            ...sanitized,
            updatedBy: DEMO_ACTOR_ID,
            updatedAt: Date.now(),
          },
        }));
        return;
      }

      try {
        await setDoc(doc(db, 'site_settings', 'main'), {
          ...sanitized,
          updatedBy: user.uid,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'site_settings/main');
      }
    },
    [user, isCloudAdmin, updateDemoStore],
  );

  const saveProgram = useCallback(
    async (
      data: Omit<AcademicProgram, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>,
      existing?: AcademicProgram | null,
    ) => {
      const id = existing?.id || generateSafeDocId('prog');
      const credits = Math.max(
        BLUEPRINT_BOUNDS.program.creditsMin,
        Math.min(BLUEPRINT_BOUNDS.program.creditsMax, Math.round(Number(data.credits) || 144)),
      );
      const sanitized = {
        code: sanitizeProgramCode(data.code),
        name: clampText(data.name, BLUEPRINT_BOUNDS.program.nameMax),
        degree: (data.degree === 'S2' ? 'S2' : 'S1') as AcademicProgram['degree'],
        faculty: clampText(data.faculty, BLUEPRINT_BOUNDS.program.facultyMax),
        accreditation: clampText(data.accreditation, 40),
        duration: clampText(data.duration, 40),
        credits,
        summary: clampText(data.summary, BLUEPRINT_BOUNDS.program.summaryMax),
        careerOutcomes: clampText(data.careerOutcomes, BLUEPRINT_BOUNDS.program.outcomesMax),
        featured: Boolean(data.featured),
        active: Boolean(data.active),
      };

      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.programs ?? cloudPrograms;
          const nextItem: AcademicProgram = {
            id,
            ...sanitized,
            authorId: existing?.authorId || DEMO_ACTOR_ID,
            createdAt: existing?.createdAt || Date.now(),
            updatedAt: Date.now(),
          };
          const exists = list.some((p) => p.id === id);
          const updated = exists ? list.map((p) => (p.id === id ? nextItem : p)) : [...list, nextItem];
          updated.sort((a, b) => (a.degree === b.degree ? a.name.localeCompare(b.name) : a.degree === 'S2' ? -1 : 1));
          return { ...prev, programs: updated };
        });
        return;
      }

      const baseFields = {
        ...sanitized,
        updatedAt: serverTimestamp(),
      };
      try {
        if (existing && isFirestoreSeeded) {
          await updateDoc(doc(db, 'programs', id), baseFields);
        } else {
          await setDoc(doc(db, 'programs', id), {
            ...baseFields,
            authorId: user.uid,
            createdAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, existing ? OperationType.UPDATE : OperationType.CREATE, `programs/${id}`);
      }
    },
    [user, isCloudAdmin, isFirestoreSeeded, cloudPrograms, updateDemoStore],
  );

  const deleteProgram = useCallback(
    async (id: string) => {
      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.programs ?? cloudPrograms;
          return { ...prev, programs: list.filter((p) => p.id !== id) };
        });
        return;
      }
      try {
        await deleteDoc(doc(db, 'programs', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `programs/${id}`);
      }
    },
    [user, isCloudAdmin, cloudPrograms, updateDemoStore],
  );

  const broadcastNotification = useCallback(
    async (data: {
      title: string;
      message: string;
      type: CampusNotification['type'];
      targetSection: string;
    }) => {
      const id = generateSafeDocId('notif');
      const sanitized = {
        title: clampText(data.title, BLUEPRINT_BOUNDS.notification.titleMax),
        message: clampText(data.message, BLUEPRINT_BOUNDS.notification.messageMax),
        type: data.type,
        targetSection: clampText(data.targetSection || 'news', 60),
        active: true,
      };

      if (!user || !isCloudAdmin) {
        const nowMs = Date.now();
        const newNotif: CampusNotification = {
          id,
          ...sanitized,
          authorId: DEMO_ACTOR_ID,
          createdAt: nowMs,
          createdAtMs: nowMs,
        };
        updateDemoStore((prev) => {
          const list = prev.notifications ?? cloudNotifications;
          return { ...prev, notifications: [newNotif, ...list] };
        });
        knownNotifIdsRef.current.add(id);
        setLatestLiveNotification(newNotif);
        return;
      }

      try {
        await setDoc(doc(db, 'notifications', id), {
          ...sanitized,
          authorId: user.uid,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `notifications/${id}`);
      }
    },
    [user, isCloudAdmin, cloudNotifications, updateDemoStore],
  );

  const savePost = useCallback(
    async (
      data: Omit<Post, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>,
      existing?: Post | null,
      alsoNotify = false,
    ) => {
      const id = existing?.id || generateSafeDocId('post');
      const sanitized = {
        title: clampText(data.title, BLUEPRINT_BOUNDS.post.titleMax),
        slug: sanitizeSlug(data.slug || data.title),
        category: data.category,
        excerpt: clampText(data.excerpt, BLUEPRINT_BOUNDS.post.excerptMax),
        content: clampText(data.content, BLUEPRINT_BOUNDS.post.contentMax),
        coverImage: clampText(data.coverImage, BLUEPRINT_BOUNDS.post.coverImageMax),
        authorName: clampText(data.authorName, BLUEPRINT_BOUNDS.post.authorNameMax),
        status: data.status,
        priority: data.priority,
        featured: Boolean(data.featured),
        views: Math.max(0, Math.round(Number(data.views) || 0)),
        publishedDate: clampText(data.publishedDate || new Date().toISOString().slice(0, 10), 32),
      };

      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.posts ?? cloudPosts;
          const nextItem: Post = {
            id,
            ...sanitized,
            authorId: existing?.authorId || DEMO_ACTOR_ID,
            createdAt: existing?.createdAt || Date.now(),
            updatedAt: Date.now(),
          };
          const exists = list.some((p) => p.id === id);
          const updated = exists ? list.map((p) => (p.id === id ? nextItem : p)) : [nextItem, ...list];
          updated.sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
          return { ...prev, posts: updated };
        });
        if (alsoNotify && data.status === 'published') {
          await broadcastNotification({
            title: sanitized.title.slice(0, BLUEPRINT_BOUNDS.notification.titleMax),
            message: sanitized.excerpt.slice(0, BLUEPRINT_BOUNDS.notification.messageMax),
            type:
              sanitized.priority === 'urgent'
                ? 'urgent'
                : sanitized.category === 'announcement'
                  ? 'announcement'
                  : 'news',
            targetSection: 'news',
          });
        }
        return;
      }

      const baseFields = {
        ...sanitized,
        updatedAt: serverTimestamp(),
      };
      try {
        if (existing && isFirestoreSeeded) {
          await updateDoc(doc(db, 'posts', id), baseFields);
        } else {
          await setDoc(doc(db, 'posts', id), {
            ...baseFields,
            authorId: user.uid,
            createdAt: serverTimestamp(),
          });
        }
        if (alsoNotify && data.status === 'published') {
          await broadcastNotification({
            title: baseFields.title.slice(0, BLUEPRINT_BOUNDS.notification.titleMax),
            message: baseFields.excerpt.slice(0, BLUEPRINT_BOUNDS.notification.messageMax),
            type:
              baseFields.priority === 'urgent'
                ? 'urgent'
                : baseFields.category === 'announcement'
                  ? 'announcement'
                  : 'news',
            targetSection: 'news',
          });
        }
      } catch (error) {
        handleFirestoreError(error, existing ? OperationType.UPDATE : OperationType.CREATE, `posts/${id}`);
      }
    },
    [user, isCloudAdmin, isFirestoreSeeded, cloudPosts, updateDemoStore, broadcastNotification],
  );

  const deletePost = useCallback(
    async (id: string) => {
      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.posts ?? cloudPosts;
          return { ...prev, posts: list.filter((p) => p.id !== id) };
        });
        return;
      }
      try {
        await deleteDoc(doc(db, 'posts', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `posts/${id}`);
      }
    },
    [user, isCloudAdmin, cloudPosts, updateDemoStore],
  );

  const saveAgenda = useCallback(
    async (
      data: Omit<AgendaEvent, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>,
      existing?: AgendaEvent | null,
      alsoNotify = false,
    ) => {
      const id = existing?.id || generateSafeDocId('agenda');
      const sanitized = {
        title: clampText(data.title, BLUEPRINT_BOUNDS.agenda.titleMax),
        eventDate: clampText(data.eventDate, 32),
        timeRange: clampText(data.timeRange, 60),
        location: clampText(data.location, BLUEPRINT_BOUNDS.agenda.locationMax),
        organizer: clampText(data.organizer, BLUEPRINT_BOUNDS.agenda.organizerMax),
        category: data.category,
        description: clampText(data.description, BLUEPRINT_BOUNDS.agenda.descriptionMax),
        status: data.status,
        active: Boolean(data.active),
      };

      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.agenda ?? cloudAgenda;
          const nextItem: AgendaEvent = {
            id,
            ...sanitized,
            authorId: existing?.authorId || DEMO_ACTOR_ID,
            createdAt: existing?.createdAt || Date.now(),
            updatedAt: Date.now(),
          };
          const exists = list.some((e) => e.id === id);
          const updated = exists ? list.map((e) => (e.id === id ? nextItem : e)) : [...list, nextItem];
          updated.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
          return { ...prev, agenda: updated };
        });
        if (alsoNotify && data.active) {
          await broadcastNotification({
            title: `Agenda: ${sanitized.title}`.slice(0, BLUEPRINT_BOUNDS.notification.titleMax),
            message: `${sanitized.eventDate} · ${sanitized.timeRange} at ${sanitized.location}`.slice(
              0,
              BLUEPRINT_BOUNDS.notification.messageMax,
            ),
            type: 'agenda',
            targetSection: 'agenda',
          });
        }
        return;
      }

      const baseFields = {
        ...sanitized,
        updatedAt: serverTimestamp(),
      };
      try {
        if (existing && isFirestoreSeeded) {
          await updateDoc(doc(db, 'agenda', id), baseFields);
        } else {
          await setDoc(doc(db, 'agenda', id), {
            ...baseFields,
            authorId: user.uid,
            createdAt: serverTimestamp(),
          });
        }
        if (alsoNotify && data.active) {
          await broadcastNotification({
            title: `Agenda: ${baseFields.title}`.slice(0, BLUEPRINT_BOUNDS.notification.titleMax),
            message: `${baseFields.eventDate} · ${baseFields.timeRange} at ${baseFields.location}`.slice(
              0,
              BLUEPRINT_BOUNDS.notification.messageMax,
            ),
            type: 'agenda',
            targetSection: 'agenda',
          });
        }
      } catch (error) {
        handleFirestoreError(error, existing ? OperationType.UPDATE : OperationType.CREATE, `agenda/${id}`);
      }
    },
    [user, isCloudAdmin, isFirestoreSeeded, cloudAgenda, updateDemoStore, broadcastNotification],
  );

  const deleteAgenda = useCallback(
    async (id: string) => {
      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.agenda ?? cloudAgenda;
          return { ...prev, agenda: list.filter((e) => e.id !== id) };
        });
        return;
      }
      try {
        await deleteDoc(doc(db, 'agenda', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `agenda/${id}`);
      }
    },
    [user, isCloudAdmin, cloudAgenda, updateDemoStore],
  );

  const saveTestimonial = useCallback(
    async (
      data: Omit<AlumniTestimonial, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>,
      existing?: AlumniTestimonial | null,
    ) => {
      const id = existing?.id || generateSafeDocId('alumni');
      const graduationYear = Math.max(
        BLUEPRINT_BOUNDS.testimonial.yearMin,
        Math.min(BLUEPRINT_BOUNDS.testimonial.yearMax, Math.round(Number(data.graduationYear) || 2023)),
      );
      const sanitized = {
        name: clampText(data.name, BLUEPRINT_BOUNDS.testimonial.nameMax),
        graduationYear,
        program: clampText(data.program, 120),
        role: clampText(data.role, 120),
        organization: clampText(data.organization, 140),
        quote: clampText(data.quote, BLUEPRINT_BOUNDS.testimonial.quoteMax),
        featured: Boolean(data.featured),
        active: Boolean(data.active),
      };

      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.testimonials ?? cloudTestimonials;
          const nextItem: AlumniTestimonial = {
            id,
            ...sanitized,
            authorId: existing?.authorId || DEMO_ACTOR_ID,
            createdAt: existing?.createdAt || Date.now(),
            updatedAt: Date.now(),
          };
          const exists = list.some((t) => t.id === id);
          const updated = exists ? list.map((t) => (t.id === id ? nextItem : t)) : [nextItem, ...list];
          updated.sort((a, b) => b.graduationYear - a.graduationYear);
          return { ...prev, testimonials: updated };
        });
        return;
      }

      const baseFields = {
        ...sanitized,
        updatedAt: serverTimestamp(),
      };
      try {
        if (existing && isFirestoreSeeded) {
          await updateDoc(doc(db, 'testimonials', id), baseFields);
        } else {
          await setDoc(doc(db, 'testimonials', id), {
            ...baseFields,
            authorId: user.uid,
            createdAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(
          error,
          existing ? OperationType.UPDATE : OperationType.CREATE,
          `testimonials/${id}`,
        );
      }
    },
    [user, isCloudAdmin, isFirestoreSeeded, cloudTestimonials, updateDemoStore],
  );

  const deleteTestimonial = useCallback(
    async (id: string) => {
      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.testimonials ?? cloudTestimonials;
          return { ...prev, testimonials: list.filter((t) => t.id !== id) };
        });
        return;
      }
      try {
        await deleteDoc(doc(db, 'testimonials', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `testimonials/${id}`);
      }
    },
    [user, isCloudAdmin, cloudTestimonials, updateDemoStore],
  );

  const saveGalleryPhoto = useCallback(
    async (
      data: Omit<GalleryPhoto, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>,
      existing?: GalleryPhoto | null,
    ) => {
      const safeImageUrl = sanitizeGalleryImageUrl(data.imageUrl);
      if (!safeImageUrl) {
        throw new Error('Please upload a valid JPG, PNG, or WebP photo or provide a valid image URL.');
      }
      const id = existing?.id || generateSafeDocId('gal');
      const displayOrder = Math.max(0, Math.min(1000, Math.round(Number(data.displayOrder) || 0)));
      const sanitized = {
        title: clampText(data.title, BLUEPRINT_BOUNDS.gallery.titleMax),
        caption: clampText(data.caption, BLUEPRINT_BOUNDS.gallery.captionMax),
        category: data.category,
        imageUrl: safeImageUrl,
        photographer: clampText(data.photographer || 'Campus Media Team', BLUEPRINT_BOUNDS.gallery.photographerMax),
        displayOrder,
        active: Boolean(data.active),
      };

      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.galleryPhotos ?? cloudGalleryPhotos;
          const nextItem: GalleryPhoto = {
            id,
            ...sanitized,
            authorId: existing?.authorId || DEMO_ACTOR_ID,
            createdAt: existing?.createdAt || Date.now(),
            updatedAt: Date.now(),
          };
          const exists = list.some((p) => p.id === id);
          const updated = exists ? list.map((p) => (p.id === id ? nextItem : p)) : [...list, nextItem];
          updated.sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title));
          return { ...prev, galleryPhotos: updated };
        });
        return;
      }

      const baseFields = {
        ...sanitized,
        updatedAt: serverTimestamp(),
      };
      try {
        if (!hasGalleryDocsRef.current) {
          const batch = writeBatch(db);
          const now = serverTimestamp();
          for (const def of DEFAULT_GALLERY_PHOTOS) {
            if (def.id === id) continue;
            const { id: defId, createdAt: _c, updatedAt: _u, ...defBody } = def;
            batch.set(doc(db, 'gallery_photos', defId), {
              ...defBody,
              authorId: user.uid,
              createdAt: now,
              updatedAt: now,
            });
          }
          batch.set(doc(db, 'gallery_photos', id), {
            ...baseFields,
            authorId: user.uid,
            createdAt: now,
            updatedAt: now,
          });
          await batch.commit();
          hasGalleryDocsRef.current = true;
        } else if (existing) {
          await updateDoc(doc(db, 'gallery_photos', id), baseFields);
        } else {
          await setDoc(doc(db, 'gallery_photos', id), {
            ...baseFields,
            authorId: user.uid,
            createdAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(
          error,
          existing ? OperationType.UPDATE : OperationType.CREATE,
          `gallery_photos/${id}`,
        );
      }
    },
    [user, isCloudAdmin, cloudGalleryPhotos, updateDemoStore],
  );

  const deleteGalleryPhoto = useCallback(
    async (id: string) => {
      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.galleryPhotos ?? cloudGalleryPhotos;
          return { ...prev, galleryPhotos: list.filter((p) => p.id !== id) };
        });
        return;
      }
      try {
        if (!hasGalleryDocsRef.current) {
          const batch = writeBatch(db);
          const now = serverTimestamp();
          for (const def of DEFAULT_GALLERY_PHOTOS) {
            if (def.id === id) continue;
            const { id: defId, createdAt: _c, updatedAt: _u, ...defBody } = def;
            batch.set(doc(db, 'gallery_photos', defId), {
              ...defBody,
              authorId: user.uid,
              createdAt: now,
              updatedAt: now,
            });
          }
          await batch.commit();
          hasGalleryDocsRef.current = true;
          return;
        }
        await deleteDoc(doc(db, 'gallery_photos', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `gallery_photos/${id}`);
      }
    },
    [user, isCloudAdmin, cloudGalleryPhotos, updateDemoStore],
  );

  const toggleGalleryPhotoActive = useCallback(
    async (photo: GalleryPhoto) => {
      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.galleryPhotos ?? cloudGalleryPhotos;
          return {
            ...prev,
            galleryPhotos: list.map((p) =>
              p.id === photo.id ? { ...p, active: !p.active, updatedAt: Date.now() } : p,
            ),
          };
        });
        return;
      }
      try {
        if (!hasGalleryDocsRef.current) {
          const batch = writeBatch(db);
          const now = serverTimestamp();
          for (const def of DEFAULT_GALLERY_PHOTOS) {
            const { id: defId, createdAt: _c, updatedAt: _u, ...defBody } = def;
            batch.set(doc(db, 'gallery_photos', defId), {
              ...defBody,
              active: defId === photo.id ? !photo.active : defBody.active,
              authorId: user.uid,
              createdAt: now,
              updatedAt: now,
            });
          }
          await batch.commit();
          hasGalleryDocsRef.current = true;
          return;
        }
        await updateDoc(doc(db, 'gallery_photos', photo.id), {
          active: !photo.active,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `gallery_photos/${photo.id}`);
      }
    },
    [user, isCloudAdmin, cloudGalleryPhotos, updateDemoStore],
  );

  const reorderGalleryPhoto = useCallback(
    async (photoId: string, direction: 'up' | 'down') => {
      const ordered = [...galleryPhotos].sort(
        (a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title),
      );
      const currentIdx = ordered.findIndex((p) => p.id === photoId);
      if (currentIdx === -1) return;
      const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
      if (targetIdx < 0 || targetIdx >= ordered.length) return;

      const swapped = [...ordered];
      [swapped[currentIdx], swapped[targetIdx]] = [swapped[targetIdx], swapped[currentIdx]];

      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => ({
          ...prev,
          galleryPhotos: swapped.map((item, idx) => ({
            ...item,
            displayOrder: idx + 1,
            updatedAt: Date.now(),
          })),
        }));
        return;
      }

      try {
        const batch = writeBatch(db);
        const now = serverTimestamp();
        if (!hasGalleryDocsRef.current) {
          swapped.forEach((item, idx) => {
            const { id: itemId, createdAt: _c, updatedAt: _u, ...body } = item;
            batch.set(doc(db, 'gallery_photos', itemId), {
              ...body,
              displayOrder: idx + 1,
              authorId: user.uid,
              createdAt: now,
              updatedAt: now,
            });
          });
          await batch.commit();
          hasGalleryDocsRef.current = true;
        } else {
          swapped.forEach((item, idx) => {
            const nextOrder = idx + 1;
            if (item.displayOrder !== nextOrder) {
              batch.update(doc(db, 'gallery_photos', item.id), {
                displayOrder: nextOrder,
                updatedAt: now,
              });
            }
          });
          await batch.commit();
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `gallery_photos/${photoId}`);
      }
    },
    [user, isCloudAdmin, galleryPhotos, updateDemoStore],
  );

  const toggleNotificationActive = useCallback(
    async (notif: CampusNotification) => {
      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.notifications ?? cloudNotifications;
          return {
            ...prev,
            notifications: list.map((n) => (n.id === notif.id ? { ...n, active: !n.active } : n)),
          };
        });
        return;
      }
      try {
        await updateDoc(doc(db, 'notifications', notif.id), {
          active: !notif.active,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `notifications/${notif.id}`);
      }
    },
    [user, isCloudAdmin, cloudNotifications, updateDemoStore],
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.notifications ?? cloudNotifications;
          return { ...prev, notifications: list.filter((n) => n.id !== id) };
        });
        return;
      }
      try {
        await deleteDoc(doc(db, 'notifications', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `notifications/${id}`);
      }
    },
    [user, isCloudAdmin, cloudNotifications, updateDemoStore],
  );

  const recordDailyAnalytics = useCallback(
    async (data: Omit<DailyAnalytics, 'id' | 'authorId' | 'updatedAt'>) => {
      const id = `day-${data.isoDate}`;
      const sanitized = {
        dateLabel: clampText(data.dateLabel, 20),
        isoDate: data.isoDate,
        visitors: Math.max(0, Math.round(data.visitors)),
        pageViews: Math.max(0, Math.round(data.pageViews)),
        searches: Math.max(0, Math.round(data.searches)),
        programViews: Math.max(0, Math.round(data.programViews)),
        mobileShare: Math.max(0, Math.min(100, Math.round(data.mobileShare))),
      };

      if (!user || !isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.dailyAnalytics ?? cloudDailyAnalytics;
          const nextRow: DailyAnalytics = {
            id,
            ...sanitized,
            authorId: DEMO_ACTOR_ID,
            updatedAt: Date.now(),
          };
          const exists = list.some((r) => r.id === id);
          const updated = exists ? list.map((r) => (r.id === id ? nextRow : r)) : [...list, nextRow];
          updated.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
          return { ...prev, dailyAnalytics: updated };
        });
        return;
      }

      try {
        await setDoc(doc(db, 'analytics_daily', id), {
          ...sanitized,
          authorId: user.uid,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `analytics_daily/${id}`);
      }
    },
    [user, isCloudAdmin, cloudDailyAnalytics, updateDemoStore],
  );

  const trackInteraction = useCallback(
    (eventType: AnalyticsEventType, label: string) => {
      const safeLabel = clampText(label || eventType, 160);
      setSessionTelemetry((prev) => {
        const next: SessionTelemetry = {
          pageViews: prev.pageViews + (eventType === 'page_view' ? 1 : 0),
          searches: prev.searches + (eventType === 'search' ? 1 : 0),
          articleReads: prev.articleReads + (eventType === 'article_read' ? 1 : 0),
          programViews: prev.programViews + (eventType === 'program_view' ? 1 : 0),
          mapInteractions: prev.mapInteractions + (eventType === 'map_interact' ? 1 : 0),
          recentEvents: [
            { id: generateSafeDocId('ev'), eventType, label: safeLabel, timestamp: Date.now() },
            ...prev.recentEvents,
          ].slice(0, 25),
        };
        try {
          localStorage.setItem(SESSION_TELEMETRY_KEY, JSON.stringify(next));
        } catch {
          // ignore storage quota errors
        }
        return next;
      });

      // Persist authenticated interaction events to Firestore
      if (user && user.emailVerified) {
        const eventId = generateSafeDocId('ev');
        void setDoc(doc(db, 'analytics_events', eventId), {
          eventType,
          label: safeLabel,
          actorId: user.uid,
          createdAt: serverTimestamp(),
        }).catch(() => {
          // Non-blocking telemetry failure
        });
      }
    },
    [user],
  );

  const incrementPostView = useCallback(
    (post: Post) => {
      trackInteraction('article_read', post.title);
      if (user && user.emailVerified && isFirestoreSeeded && isCloudAdmin) {
        void updateDoc(doc(db, 'posts', post.id), {
          views: post.views + 1,
          updatedAt: serverTimestamp(),
        }).catch(() => {
          // Non-blocking view increment
        });
      } else if (!isCloudAdmin) {
        updateDemoStore((prev) => {
          const list = prev.posts ?? cloudPosts;
          return {
            ...prev,
            posts: list.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p)),
          };
        });
      }
    },
    [user, isFirestoreSeeded, isCloudAdmin, cloudPosts, updateDemoStore, trackInteraction],
  );

  const unreadNotificationCount = useMemo(() => {
    const activeList = notifications.filter((n) => n.active);
    return activeList.filter((n) => !readNotifIds.includes(n.id)).length;
  }, [notifications, readNotifIds]);

  const markAllNotificationsRead = useCallback(() => {
    const ids = notifications.map((n) => n.id);
    setReadNotifIds(ids);
    try {
      localStorage.setItem(READ_NOTIFS_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, [notifications]);

  const dismissLiveToast = useCallback(() => {
    setLatestLiveNotification(null);
  }, []);

  const value: CampusContextValue = {
    user,
    authReady,
    isAdmin: true, // Demo credential bypass enabled: direct access to CMS without Google Sign-In
    isDemoMode,
    isCloudSynced: isCloudAdmin,
    authError,
    signInAdmin,
    signOutUser,
    resetDemoData,
    siteSettings,
    programs,
    posts,
    agenda,
    testimonials,
    galleryPhotos,
    notifications,
    dailyAnalytics,
    analyticsEvents,
    sessionTelemetry,
    isFirestoreSeeded,
    isLoadingData,
    isSeeding,
    unreadNotificationCount,
    latestLiveNotification,
    dismissLiveToast,
    markAllNotificationsRead,
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
    recordDailyAnalytics,
    trackInteraction,
    incrementPostView,
  };

  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
};

export function useCampus(): CampusContextValue {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error('useCampus must be used inside CampusProvider');
  return ctx;
}
