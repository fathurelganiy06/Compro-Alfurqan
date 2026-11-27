import type {
  AcademicProgram,
  AgendaEvent,
  AlumniTestimonial,
  CampusNotification,
  DailyAnalytics,
  GalleryPhoto,
  Post,
  SiteSettings,
} from '../types/cms';

export const UNIVERSITY_MEDIA = {
  logo: '/assets/aistudio/mpf7gSSp_400x400_94d048f9.jpg',
  heroCourtyard: '/src/assets/images/campus_hero_courtyard_1795707779349.jpg',
  libraryHall: '/src/assets/images/academic_library_hall_1795707781264.jpg',
  symposiumHall: '/src/assets/images/campus_symposium_hall_1795707781757.jpg',
  tahfidzClass: '/src/assets/images/tahfidz_community_class_1795707786523.jpg',
  graduationCourtyard: '/src/assets/images/campus_graduation_courtyard_1795733788506.jpg',
  studentCollaboration: '/src/assets/images/campus_student_collaboration_1795733789345.jpg',
} as const;

export const COVER_IMAGE_PRESETS = [
  { label: 'Campus Courtyard', url: UNIVERSITY_MEDIA.heroCourtyard },
  { label: 'Academic Library', url: UNIVERSITY_MEDIA.libraryHall },
  { label: 'Auditorium Symposium', url: UNIVERSITY_MEDIA.symposiumHall },
  { label: 'Tahfidz & Seminar Pavilion', url: UNIVERSITY_MEDIA.tahfidzClass },
  { label: 'Graduation Procession', url: UNIVERSITY_MEDIA.graduationCourtyard },
  { label: 'Student Study Colonnade', url: UNIVERSITY_MEDIA.studentCollaboration },
] as const;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'main',
  institutionName: 'STAI Al-Furqan Makassar',
  heroTitle: 'Cultivating Qur’anic Scholarship & Ethical Leadership in Eastern Indonesia',
  heroSubtitle:
    'Sekolah Tinggi Agama Islam Al-Furqan Makassar unites rigorous Islamic jurisprudence, contemporary pedagogy, and Tilawah & Tahfidzul Qur’an excellence across undergraduate and postgraduate pathways.',
  admissionsOpen: true,
  admissionsLabel: 'Academic Year 2026/2027 Admissions Open — Wave II',
  vision:
    'To become a high-quality, religious, innovative, and competitive Islamic higher-education institution distinguished in Tilawah and Tahfidzul Qur’an across Eastern Indonesia.',
  mission:
    'Educate scholars grounded in Tafaqquh fid-din and contemporary research; advance community service rooted in Islamic ethics; foster academic publications and institutional partnerships across Nusantara and international Islamic networks.',
  rectorName: 'Dr. H. Muh. Yusuf, M.Pd.I',
  rectorTitle: 'Chairman, STAI Al-Furqan Makassar',
  rectorMessage:
    'Since our founding in Makassar, STAI Al-Furqan has remained dedicated to forming graduates who harmonize deep textual mastery of Islamic sciences with practical leadership in education, family law, and community guidance.',
  address: 'Jl. Perintis Kemerdekaan KM. 15, Kelurahan Daya, Kecamatan Biringkanaya, Kota Makassar, Sulawesi Selatan 90241',
  phone: '+62 411 510 248',
  email: 'info@staialfurqanmakassar.ac.id',
  socialInstagram: 'https://www.instagram.com/staialfurqanmakassar',
  socialFacebook: 'https://www.facebook.com/staialfurqanmakassar',
  socialTwitter: 'https://x.com/staialfurqanmks',
  socialYoutube: 'https://www.youtube.com/@staialfurqanmakassar',
  updatedBy: 'seed',
};

export const DEFAULT_PROGRAMS: AcademicProgram[] = [
  {
    id: 'prog-s2-pai',
    code: 'S2-PAI',
    name: 'Master of Islamic Religious Education (PAI)',
    degree: 'S2',
    faculty: 'Postgraduate Program (Pascasarjana)',
    accreditation: 'B (Baik Sekali)',
    duration: '4 Semesters',
    credits: 44,
    summary:
      'Advanced postgraduate research and leadership curriculum in Islamic curriculum engineering, educational management, and contemporary pedagogy.',
    careerOutcomes:
      'University Lecturer, Madrasah Principal, Curriculum Consultant, Ministry of Religious Affairs Policy Specialist.',
    featured: true,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'prog-s1-pai',
    code: 'S1-PAI',
    name: 'Islamic Religious Education (PAI)',
    degree: 'S1',
    faculty: 'Faculty of Tarbiyah',
    accreditation: 'B (Baik Sekali)',
    duration: '8 Semesters',
    credits: 146,
    summary:
      'Comprehensive teacher education program integrating classical Islamic sciences, modern classroom methodology, and Qur’anic recitation mastery.',
    careerOutcomes:
      'Certified Islamic Studies Educator, Academic Coordinator, Educational Media Developer, Tahfidz Program Director.',
    featured: true,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'prog-s1-pgmi',
    code: 'S1-PGMI',
    name: 'Islamic Elementary Teacher Education (PGMI)',
    degree: 'S1',
    faculty: 'Faculty of Tarbiyah',
    accreditation: 'Baik',
    duration: '8 Semesters',
    credits: 144,
    summary:
      'Prepares primary-level educators for Madrasah Ibtidaiyah and integrated Islamic elementary schools with literacy, numeracy, and character pedagogy.',
    careerOutcomes:
      'Madrasah Ibtidaiyah Homeroom Teacher, Primary Curriculum Designer, Children’s Literacy Specialist.',
    featured: true,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'prog-s1-piaud',
    code: 'S1-PIAUD',
    name: 'Early Childhood Islamic Education (PIAUD)',
    degree: 'S1',
    faculty: 'Faculty of Tarbiyah',
    accreditation: 'Baik',
    duration: '8 Semesters',
    credits: 144,
    summary:
      'Focused on developmental psychology, playful Qur’anic early literacy, and inclusive early childhood school leadership.',
    careerOutcomes:
      'RA / PAUD Educator, Early Childhood Center Founder, Child Development Program Coordinator.',
    featured: false,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'prog-s1-hki',
    code: 'S1-HKI',
    name: 'Islamic Family Law (Ahwal Al-Syakhshiyah)',
    degree: 'S1',
    faculty: 'Faculty of Syariah',
    accreditation: 'Baik',
    duration: '8 Semesters',
    credits: 146,
    summary:
      'Equips graduates with deep mastery of Fiqh Munakahat, inheritance jurisprudence, Indonesian Religious Court procedure, and family mediation.',
    careerOutcomes:
      'Religious Court Legal Analyst, Certified Family Mediator, KUA Penghulu Candidate, Sharia Legal Consultant.',
    featured: true,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'prog-s1-bpi',
    code: 'S1-BPI',
    name: 'Islamic Guidance & Counseling (BPI)',
    degree: 'S1',
    faculty: 'Faculty of Dakwah',
    accreditation: 'Baik',
    duration: '8 Semesters',
    credits: 144,
    summary:
      'Blends Islamic spiritual counseling, modern psychosocial guidance, and digital dakwah communication for schools and community institutions.',
    careerOutcomes:
      'School & Pesantren Counselor, Community Social Worker, Religious Extension Officer (Penyuluh Agama).',
    featured: false,
    active: true,
    authorId: 'seed',
  },
];

export const DEFAULT_POSTS: Post[] = [
  {
    id: 'post-national-symposium-2026',
    title: 'STAI Al-Furqan Makassar Hosts Eastern Indonesia Islamic Pedagogy & Tahfidz Symposium',
    slug: 'eastern-indonesia-islamic-pedagogy-tahfidz-symposium',
    category: 'news',
    excerpt:
      'More than 420 educators, pesantren leaders, and postgraduate researchers convened at Daya Campus to discuss digital-era Qur’anic learning.',
    content:
      'Sekolah Tinggi Agama Islam (STAI) Al-Furqan Makassar successfully hosted the Annual Eastern Indonesia Islamic Pedagogy & Tahfidz Symposium at the Main Auditorium on Jl. Perintis Kemerdekaan KM. 15.\n\nKeynote addresses explored how Madrasah and pesantren institutions across South Sulawesi can strengthen structured Tahfidzul Qur’an mentorship while adopting modern formative assessment frameworks. Deans from the Faculty of Tarbiyah and Postgraduate Program also signed three regional research partnerships with partner schools across Makassar, Maros, and Gowa.\n\nProceedings from the symposium will be published in the upcoming edition of the STAI Al-Furqan Scientific Journal and made available through the Campus Digital Library.',
    coverImage: UNIVERSITY_MEDIA.symposiumHall,
    authorName: 'Campus Public Relations',
    status: 'published',
    priority: 'important',
    featured: true,
    views: 1284,
    publishedDate: '2026-11-22',
    authorId: 'seed',
  },
  {
    id: 'post-admissions-wave-2',
    title: 'Official Notice: Wave II New Student Admissions & Tahfidz Scholarship Registration',
    slug: 'wave-2-admissions-tahfidz-scholarship-2026',
    category: 'announcement',
    excerpt:
      'Prospective S1 and S2 candidates may submit documents online or at the Daya Campus Admissions Desk through December 18, 2026.',
    content:
      'The Admissions Committee (PMB) of STAI Al-Furqan Makassar officially announces the opening of Wave II New Student Registration for Academic Year 2026/2027 across all five Undergraduate (S1) programs and the Postgraduate (S2 PAI) program.\n\nFull and partial tuition waivers are available under the Al-Furqan Tahfidz Excellence Scholarship for applicants with verified memorization of 5, 10, or 30 Juz, as well as KIP-Kuliah pathways for eligible undergraduate entrants.\n\nPlacement interviews and Qur’anic reading assessments take place every Tuesday and Thursday from 09:00 to 14:00 WITA at the Academic Administration Bureau.',
    coverImage: UNIVERSITY_MEDIA.heroCourtyard,
    authorName: 'Admissions Bureau (PMB)',
    status: 'published',
    priority: 'urgent',
    featured: true,
    views: 2140,
    publishedDate: '2026-11-24',
    authorId: 'seed',
  },
  {
    id: 'post-article-tafaqquh-digital',
    title: 'Reimagining Tafaqquh Fid-Din: Classical Manuscript Literacy in Contemporary Classrooms',
    slug: 'reimagining-tafaqquh-fid-din-classical-manuscript-literacy',
    category: 'article',
    excerpt:
      'Faculty reflection on pairing sanad-based textual analysis with open digital archives for undergraduate Tarbiyah and Syariah students.',
    content:
      'Across Indonesian Islamic higher education, one of the defining academic challenges is bridging the methodological rigor of classical Kitab Kuning scholarship with contemporary empirical inquiry.\n\nAt STAI Al-Furqan Makassar, seminar courses in the Faculty of Tarbiyah and Faculty of Syariah have introduced comparative reading circles where students verify primary Arabic jurisprudence texts alongside contemporary Indonesian family court rulings and classroom case studies.\n\nEarly outcomes from the 2025/2026 academic cycle show marked gains in thesis citation depth and oral defense clarity among final-year cohorts.',
    coverImage: UNIVERSITY_MEDIA.libraryHall,
    authorName: 'Dr. St. Aisyah Rahman, M.Ag',
    status: 'published',
    priority: 'normal',
    featured: false,
    views: 876,
    publishedDate: '2026-11-18',
    authorId: 'seed',
  },
  {
    id: 'post-tahfidz-wisuda-cohort',
    title: '38 Students Complete Campus Tahfidz Certification Ahead of Annual Commencement',
    slug: '38-students-complete-campus-tahfidz-certification',
    category: 'news',
    excerpt:
      'Participants from PAI, PGMI, and HKI completed public tasmi examinations before faculty examiners at the Campus Mosque Pavilion.',
    content:
      'Thirty-eight undergraduate and postgraduate students earned their official STAI Al-Furqan Tahfidz & Tilawah Certification following three days of open tasmi examinations overseen by the Center for Qur’anic Studies.\n\nThe program complements degree coursework with daily guided halaqah sessions, ensuring graduates leave campus equipped to lead Tilawah and Tahfidz curricula in schools and communities across Eastern Indonesia.',
    coverImage: UNIVERSITY_MEDIA.tahfidzClass,
    authorName: 'Center for Qur’anic Studies',
    status: 'published',
    priority: 'normal',
    featured: false,
    views: 964,
    publishedDate: '2026-11-14',
    authorId: 'seed',
  },
  {
    id: 'post-announcement-kkn-2026',
    title: 'Registration Schedule for Community Service Program (KKN Angkatan XXXIV)',
    slug: 'registration-schedule-kkn-angkatan-34',
    category: 'announcement',
    excerpt:
      'Sixth-semester students who have completed 110 credits must finalize KKN placement registration before December 5, 2026.',
    content:
      'The Institute for Research and Community Service (LP2M) notifies all eligible sixth-semester students that registration for KKN Angkatan XXXIV is now open.\n\nPlacement sites include partner villages in Maros, Pangkep, and Gowa focusing on mosque-based youth literacy, early childhood madrasah mentoring, and family legal awareness clinics. Briefing orientation will be held at the Main Auditorium on December 10, 2026.',
    coverImage: UNIVERSITY_MEDIA.tahfidzClass,
    authorName: 'LP2M Academic Office',
    status: 'published',
    priority: 'important',
    featured: false,
    views: 1105,
    publishedDate: '2026-11-20',
    authorId: 'seed',
  },
  {
    id: 'post-article-family-mediation',
    title: 'Preventive Family Mediation in South Sulawesi: Insights from Syariah Field Clinics',
    slug: 'preventive-family-mediation-south-sulawesi-clinics',
    category: 'article',
    excerpt:
      'How practicum collaborations between HKI students and local KUA offices improve pre-marital counseling literacy.',
    content:
      'Field practicum reports compiled by Islamic Family Law (HKI) students during the past two semesters highlight the decisive role of structured pre-marital guidance in strengthening household resilience.\n\nWorking under faculty supervision alongside district religious affairs offices in Biringkanaya and Tamalanrea, students developed accessible Indonesian and Bugis-Makassar educational modules explaining marital rights, financial stewardship, and constructive dispute resolution.',
    coverImage: UNIVERSITY_MEDIA.libraryHall,
    authorName: 'Ahmad Fadli, S.H.I., M.H.',
    status: 'published',
    priority: 'normal',
    featured: false,
    views: 642,
    publishedDate: '2026-11-10',
    authorId: 'seed',
  },
];

export const DEFAULT_AGENDA: AgendaEvent[] = [
  {
    id: 'agenda-open-house-2026',
    title: 'Campus Open House & Wave II Admissions Consultation',
    eventDate: '2026-12-03',
    timeRange: '08:30 – 14:00 WITA',
    location: 'Rectorate Hall & Daya Courtyard, Campus I',
    organizer: 'Admissions Bureau (PMB)',
    category: 'admissions',
    description:
      'Guided campus tours, faculty consultations for all S1 and S2 programs, and on-site Tahfidz scholarship verification.',
    status: 'upcoming',
    active: true,
    authorId: 'seed',
  },
  {
    id: 'agenda-kkn-briefing',
    title: 'KKN Angkatan XXXIV Field Placement Briefing',
    eventDate: '2026-12-10',
    timeRange: '09:00 – 12:30 WITA',
    location: 'Main Auditorium, 2nd Floor',
    organizer: 'LP2M STAI Al-Furqan',
    category: 'academic',
    description:
      'Mandatory orientation covering community engagement ethics, program reporting templates, and district supervisor assignments.',
    status: 'upcoming',
    active: true,
    authorId: 'seed',
  },
  {
    id: 'agenda-postgrad-colloquium',
    title: 'Postgraduate Thesis Proposal Colloquium (S2 PAI)',
    eventDate: '2026-12-15',
    timeRange: '13:00 – 17:00 WITA',
    location: 'Postgraduate Seminar Room B2',
    organizer: 'Pascasarjana Office',
    category: 'seminar',
    description:
      'Open academic defense of qualitative and mixed-methods research proposals by third-semester S2 PAI candidates.',
    status: 'upcoming',
    active: true,
    authorId: 'seed',
  },
  {
    id: 'agenda-mtq-campus',
    title: 'Annual Campus Musabaqah Tilawatil Qur’an (MTQ)',
    eventDate: '2026-12-21',
    timeRange: '08:00 – 16:30 WITA',
    location: 'Al-Furqan Campus Mosque Pavilion',
    organizer: 'Student Executive Board (BEM) & LPTQ',
    category: 'student-life',
    description:
      'Inter-faculty competitions in Tilawah, Hifdzil Qur’an (5 & 10 Juz), Syarhil Qur’an, and Islamic Calligraphy.',
    status: 'upcoming',
    active: true,
    authorId: 'seed',
  },
  {
    id: 'agenda-uas-schedule',
    title: 'Odd Semester Final Examinations (UAS 2026/2027)',
    eventDate: '2027-01-11',
    timeRange: '08:00 – 15:30 WITA',
    location: 'Tarbiyah, Syariah & Dakwah Lecture Wings',
    organizer: 'Academic Administration Bureau',
    category: 'academic',
    description:
      'Semester-end written and oral examinations for all registered undergraduate and postgraduate courses.',
    status: 'upcoming',
    active: true,
    authorId: 'seed',
  },
];

export const DEFAULT_TESTIMONIALS: AlumniTestimonial[] = [
  {
    id: 'alumni-nurul-hikmah',
    name: 'Nurul Hikmah, M.Pd',
    graduationYear: 2022,
    program: 'S2 Pendidikan Agama Islam',
    role: 'Academic Vice Principal',
    organization: 'MAN 2 Kota Makassar',
    quote:
      'Completing my master’s thesis at STAI Al-Furqan reshaped how I design teacher mentoring programs. Within one year of graduation, our school integrated a structured Tahfidz assessment rubric based directly on my postgraduate research.',
    featured: true,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'alumni-muh-syahrul',
    name: 'Muhammad Syahrul, S.H',
    graduationYear: 2021,
    program: 'S1 Hukum Keluarga Islam',
    role: 'Certified Family Mediator',
    organization: 'Pengadilan Agama Sungguminasa',
    quote:
      'The combination of classical fiqh analysis and real Religious Court practicum prepared me from day one. My faculty advisors pushed us to write clear legal briefs and practice compassionate mediation.',
    featured: true,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'alumni-andi-fitriani',
    name: 'Andi Fitriani, S.Pd',
    graduationYear: 2023,
    program: 'S1 Pendidikan Guru Madrasah Ibtidaiyah',
    role: 'Lead Primary Educator',
    organization: 'SDIT Al-Biruni Mandiri Makassar',
    quote:
      'Micro-teaching labs and daily Tilawah coaching at Daya Campus gave me practical confidence in front of primary students. Ninety percent of my graduating circle secured teaching placements within four months.',
    featured: true,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'alumni-rahmatullah',
    name: 'Rahmatullah, S.Sos',
    graduationYear: 2020,
    program: 'S1 Bimbingan & Penyuluhan Islam',
    role: 'Youth Guidance Coordinator',
    organization: 'Kementerian Agama Kab. Maros',
    quote:
      'STAI Al-Furqan taught me to listen deeply and serve communities across rural South Sulawesi with cultural sensitivity, sound Islamic ethics, and organized public communication.',
    featured: false,
    active: true,
    authorId: 'seed',
  },
];

export const DEFAULT_NOTIFICATIONS: CampusNotification[] = [
  {
    id: 'notif-admissions-wave-2',
    title: 'Wave II Admissions & Tahfidz Scholarship Open',
    message:
      'Online and on-campus registration for S1 and S2 programs is open until December 18, 2026.',
    type: 'urgent',
    targetSection: 'news',
    active: true,
    authorId: 'seed',
    createdAtMs: Date.now() - 1000 * 60 * 35,
  },
  {
    id: 'notif-open-house',
    title: 'Campus Open House — December 3',
    message:
      'Visit Daya Campus for program consultations, library tours, and scholarship desk reviews.',
    type: 'agenda',
    targetSection: 'agenda',
    active: true,
    authorId: 'seed',
    createdAtMs: Date.now() - 1000 * 60 * 180,
  },
  {
    id: 'notif-kkn-deadline',
    title: 'KKN Angkatan XXXIV Registration Deadline',
    message:
      'Eligible 6th-semester students must complete LP2M placement forms before December 5, 2026.',
    type: 'announcement',
    targetSection: 'news',
    active: true,
    authorId: 'seed',
    createdAtMs: Date.now() - 1000 * 60 * 420,
  },
];

export const DEFAULT_DAILY_ANALYTICS: DailyAnalytics[] = [
  { id: 'day-2026-11-13', dateLabel: 'Nov 13', isoDate: '2026-11-13', visitors: 312, pageViews: 840, searches: 94, programViews: 178, mobileShare: 68, authorId: 'seed' },
  { id: 'day-2026-11-14', dateLabel: 'Nov 14', isoDate: '2026-11-14', visitors: 289, pageViews: 765, searches: 81, programViews: 152, mobileShare: 71, authorId: 'seed' },
  { id: 'day-2026-11-15', dateLabel: 'Nov 15', isoDate: '2026-11-15', visitors: 264, pageViews: 710, searches: 77, programViews: 141, mobileShare: 74, authorId: 'seed' },
  { id: 'day-2026-11-16', dateLabel: 'Nov 16', isoDate: '2026-11-16', visitors: 428, pageViews: 1185, searches: 146, programViews: 264, mobileShare: 64, authorId: 'seed' },
  { id: 'day-2026-11-17', dateLabel: 'Nov 17', isoDate: '2026-11-17', visitors: 465, pageViews: 1310, searches: 162, programViews: 295, mobileShare: 65, authorId: 'seed' },
  { id: 'day-2026-11-18', dateLabel: 'Nov 18', isoDate: '2026-11-18', visitors: 510, pageViews: 1440, searches: 185, programViews: 320, mobileShare: 66, authorId: 'seed' },
  { id: 'day-2026-11-19', dateLabel: 'Nov 19', isoDate: '2026-11-19', visitors: 482, pageViews: 1352, searches: 174, programViews: 304, mobileShare: 67, authorId: 'seed' },
  { id: 'day-2026-11-20', dateLabel: 'Nov 20', isoDate: '2026-11-20', visitors: 538, pageViews: 1560, searches: 210, programViews: 348, mobileShare: 69, authorId: 'seed' },
  { id: 'day-2026-11-21', dateLabel: 'Nov 21', isoDate: '2026-11-21', visitors: 412, pageViews: 1120, searches: 148, programViews: 256, mobileShare: 73, authorId: 'seed' },
  { id: 'day-2026-11-22', dateLabel: 'Nov 22', isoDate: '2026-11-22', visitors: 594, pageViews: 1745, searches: 238, programViews: 392, mobileShare: 72, authorId: 'seed' },
  { id: 'day-2026-11-23', dateLabel: 'Nov 23', isoDate: '2026-11-23', visitors: 640, pageViews: 1920, searches: 264, programViews: 440, mobileShare: 66, authorId: 'seed' },
  { id: 'day-2026-11-24', dateLabel: 'Nov 24', isoDate: '2026-11-24', visitors: 718, pageViews: 2180, searches: 312, programViews: 515, mobileShare: 68, authorId: 'seed' },
  { id: 'day-2026-11-25', dateLabel: 'Nov 25', isoDate: '2026-11-25', visitors: 685, pageViews: 2040, searches: 289, programViews: 482, mobileShare: 70, authorId: 'seed' },
  { id: 'day-2026-11-26', dateLabel: 'Nov 26', isoDate: '2026-11-26', visitors: 742, pageViews: 2290, searches: 334, programViews: 548, mobileShare: 69, authorId: 'seed' },
];

export const DEFAULT_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'gal-courtyard-morning',
    title: 'Morning Walk Along Daya Campus Courtyard',
    caption:
      'Students gathering along the main limestone colonnades facing Al-Furqan Campus Mosque ahead of morning lectures in Daya, Makassar.',
    category: 'campus',
    imageUrl: UNIVERSITY_MEDIA.heroCourtyard,
    photographer: 'Campus Media Unit',
    displayOrder: 0,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'gal-graduation-procession',
    title: 'Annual Commencement Procession & Families',
    caption:
      'Newly conferred S1 and S2 graduates celebrate with proud families across the main courtyard following academic senate inauguration.',
    category: 'events',
    imageUrl: UNIVERSITY_MEDIA.graduationCourtyard,
    photographer: 'Public Relations Office',
    displayOrder: 1,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'gal-student-colonnade',
    title: 'Interdisciplinary Student Research Circle',
    caption:
      'Tarbiyah and Syariah students collaborating on thesis fieldwork and digital educational modules beneath the shaded courtyard colonnade.',
    category: 'student-life',
    imageUrl: UNIVERSITY_MEDIA.studentCollaboration,
    photographer: 'Student Press (LPM)',
    displayOrder: 2,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'gal-central-library',
    title: 'Central Library & Classical Manuscript Hall',
    caption:
      'Quiet morning study hours inside the main reading room housing Kitab Kuning references, national journals, and digital theses.',
    category: 'academics',
    imageUrl: UNIVERSITY_MEDIA.libraryHall,
    photographer: 'Central Library Team',
    displayOrder: 3,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'gal-tahfidz-halaqah',
    title: 'Guided Tilawah & Tahfidzul Qur’an Halaqah',
    caption:
      'Weekly small-group Qur’anic recitation mentorship with faculty examiners in the open-air garden seminar pavilion.',
    category: 'student-life',
    imageUrl: UNIVERSITY_MEDIA.tahfidzClass,
    photographer: 'Center for Qur’anic Studies',
    displayOrder: 4,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'gal-national-symposium',
    title: 'Eastern Indonesia Islamic Pedagogy Symposium',
    caption:
      'Academic keynote address inside the Main Auditorium welcoming educators, pesantren leaders, and postgraduate researchers.',
    category: 'events',
    imageUrl: UNIVERSITY_MEDIA.symposiumHall,
    photographer: 'Campus Media Unit',
    displayOrder: 5,
    active: true,
    authorId: 'seed',
  },
];
