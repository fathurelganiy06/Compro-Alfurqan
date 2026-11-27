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
  { label: 'Pelataran Kampus Daya', url: UNIVERSITY_MEDIA.heroCourtyard },
  { label: 'Perpustakaan Pusat', url: UNIVERSITY_MEDIA.libraryHall },
  { label: 'Auditorium Simposium', url: UNIVERSITY_MEDIA.symposiumHall },
  { label: 'Pendopo Tahfidz & Kajian', url: UNIVERSITY_MEDIA.tahfidzClass },
  { label: 'Prosesi Wisuda Kampus', url: UNIVERSITY_MEDIA.graduationCourtyard },
  { label: 'Selasar Diskusi Mahasiswa', url: UNIVERSITY_MEDIA.studentCollaboration },
] as const;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'main',
  institutionName: 'STAI Al-Furqan Makassar',
  heroTitle: 'Mencetak Cendekiawan Qur’ani & Pemimpin Berakhlak di Kawasan Timur Indonesia',
  heroSubtitle:
    'Sekolah Tinggi Agama Islam Al-Furqan Makassar memadukan kedalaman ilmu keislaman, pedagogi modern, serta keunggulan Tilawah dan Tahfidzul Qur’an pada jenjang Sarjana (S1) dan Pascasarjana (S2).',
  admissionsOpen: true,
  admissionsLabel: 'Penerimaan Mahasiswa Baru Tahun Akademik 2026/2027 — Gelombang II Dibuka',
  vision:
    'Menjadi perguruan tinggi keagamaan Islam yang bermutu, religius, inovatif, dan kompetitif serta unggul dalam bidang Tilawah dan Tahfidzul Qur’an di Kawasan Timur Indonesia.',
  mission:
    'Menyelenggarakan pendidikan tinggi berbasis Tafaqquh fid-din dan riset kontemporer; mengembangkan pengabdian masyarakat yang berlandaskan etika Islam; serta memperkuat publikasi ilmiah dan jejaring kemitraan pendidikan nasional maupun internasional.',
  rectorName: 'Dr. H. Muh. Yusuf, M.Pd.I',
  rectorTitle: 'Ketua STAI Al-Furqan Makassar',
  rectorMessage:
    'Sejak berdiri di Kota Makassar, STAI Al-Furqan berkomitmen melahirkan lulusan yang memadukan penguasaan khazanah ilmu keislaman klasik dengan kepemimpinan praktis di bidang pendidikan, hukum keluarga Islam, dan bimbingan kemasyarakatan.',
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
    name: 'Magister Pendidikan Agama Islam (PAI)',
    degree: 'S2',
    faculty: 'Program Pascasarjana',
    accreditation: 'B (Baik Sekali)',
    duration: '4 Semester',
    credits: 44,
    summary:
      'Program magister berbasis riset dan kepemimpinan pendidikan yang berfokus pada pengembangan kurikulum Islam, manajemen lembaga pendidikan, serta pedagogi kontemporer.',
    careerOutcomes:
      'Dosen Perguruan Tinggi, Kepala Madrasah, Konsultan Kurikulum, Analis Kebijakan Pendidikan Kementerian Agama.',
    featured: true,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'prog-s1-pai',
    code: 'S1-PAI',
    name: 'Pendidikan Agama Islam (PAI)',
    degree: 'S1',
    faculty: 'Fakultas Tarbiyah',
    accreditation: 'B (Baik Sekali)',
    duration: '8 Semester',
    credits: 146,
    summary:
      'Program pendidikan calon guru profesional yang mengintegrasikan ilmu keislaman klasik, metodologi pembelajaran modern, serta penguasaan Tilawah dan Tahfidzul Qur’an.',
    careerOutcomes:
      'Guru Pendidikan Agama Islam Tersertifikasi, Koordinator Akademik, Pengembang Media Pembelajaran, Pembina Program Tahfidz.',
    featured: true,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'prog-s1-pgmi',
    code: 'S1-PGMI',
    name: 'Pendidikan Guru Madrasah Ibtidaiyah (PGMI)',
    degree: 'S1',
    faculty: 'Fakultas Tarbiyah',
    accreditation: 'Baik',
    duration: '8 Semester',
    credits: 144,
    summary:
      'Menyiapkan pendidik tingkat dasar untuk Madrasah Ibtidaiyah dan SD Islam Terpadu dengan kompetensi literasi, numerasi, serta pembinaan karakter islami.',
    careerOutcomes:
      'Guru Kelas Madrasah Ibtidaiyah, Perancang Kurikulum Pendidikan Dasar, Spesialis Literasi Anak.',
    featured: true,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'prog-s1-piaud',
    code: 'S1-PIAUD',
    name: 'Pendidikan Islam Anak Usia Dini (PIAUD)',
    degree: 'S1',
    faculty: 'Fakultas Tarbiyah',
    accreditation: 'Baik',
    duration: '8 Semester',
    credits: 144,
    summary:
      'Berfokus pada psikologi perkembangan anak, pembelajaran literasi Al-Qur’an yang menyenangkan, serta pengelolaan lembaga RA dan PAUD Islam inklusif.',
    careerOutcomes:
      'Pendidik RA / PAUD, Pengelola Lembaga Pendidikan Anak Usia Dini, Koordinator Program Tumbuh Kembang Anak.',
    featured: false,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'prog-s1-hki',
    code: 'S1-HKI',
    name: 'Hukum Keluarga Islam (Ahwal Al-Syakhshiyah)',
    degree: 'S1',
    faculty: 'Fakultas Syariah',
    accreditation: 'Baik',
    duration: '8 Semester',
    credits: 146,
    summary:
      'Membekali mahasiswa dengan penguasaan mendalam atas Fiqh Munakahat, hukum kewarisan Islam, hukum acara Peradilan Agama, serta mediasi keluarga.',
    careerOutcomes:
      'Analis Hukum Peradilan Agama, Mediator Keluarga Tersertifikasi, Calon Penghulu KUA, Konsultan Hukum Syariah.',
    featured: true,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'prog-s1-bpi',
    code: 'S1-BPI',
    name: 'Bimbingan & Penyuluhan Islam (BPI)',
    degree: 'S1',
    faculty: 'Fakultas Dakwah',
    accreditation: 'Baik',
    duration: '8 Semester',
    credits: 144,
    summary:
      'Memadukan konseling spiritual Islam, pendampingan psikososial modern, serta komunikasi dakwah digital untuk lembaga pendidikan dan masyarakat.',
    careerOutcomes:
      'Konselor Sekolah & Pesantren, Pendamping Sosial Kemasyarakatan, Penyuluh Agama Islam.',
    featured: false,
    active: true,
    authorId: 'seed',
  },
];

export const DEFAULT_POSTS: Post[] = [
  {
    id: 'post-national-symposium-2026',
    title: 'STAI Al-Furqan Makassar Gelar Simposium Pedagogi Islam & Tahfidz Kawasan Timur Indonesia',
    slug: 'simposium-pedagogi-islam-tahfidz-kawasan-timur-indonesia',
    category: 'news',
    excerpt:
      'Lebih dari 420 pendidik, pimpinan pesantren, dan peneliti pascasarjana berkumpul di Kampus Daya membahas pembelajaran Al-Qur’an era digital.',
    content:
      'Sekolah Tinggi Agama Islam (STAI) Al-Furqan Makassar sukses menyelenggarakan Simposium Tahunan Pedagogi Islam & Tahfidz Kawasan Timur Indonesia di Auditorium Utama, Jl. Perintis Kemerdekaan KM. 15.\n\nPara narasumber utama memaparkan strategi penguatan pembinaan Tahfidzul Qur’an terstruktur di madrasah dan pesantren se-Sulawesi Selatan yang selaras dengan sistem evaluasi formatif modern. Pimpinan Fakultas Tarbiyah dan Program Pascasarjana juga menandatangani tiga nota kesepahaman riset bersama madrasah mitra di Makassar, Maros, dan Gowa.\n\nSeluruh makalah terpilih dari simposium ini akan diterbitkan pada edisi mendatang Jurnal Ilmiah STAI Al-Furqan dan dapat diakses secara terbuka melalui Perpustakaan Digital Kampus.',
    coverImage: UNIVERSITY_MEDIA.symposiumHall,
    authorName: 'Humas Kampus',
    status: 'published',
    priority: 'important',
    featured: true,
    views: 1284,
    publishedDate: '2026-11-22',
    authorId: 'seed',
  },
  {
    id: 'post-admissions-wave-2',
    title: 'Pengumuman Resmi: Pendaftaran Mahasiswa Baru Gelombang II & Beasiswa Tahfidz 2026/2027',
    slug: 'pendaftaran-pmb-gelombang-2-beasiswa-tahfidz-2026',
    category: 'announcement',
    excerpt:
      'Calon mahasiswa jenjang S1 dan S2 dapat melengkapi berkas secara daring atau langsung di Loket PMB Kampus Daya hingga 18 Desember 2026.',
    content:
      'Panitia Penerimaan Mahasiswa Baru (PMB) STAI Al-Furqan Makassar secara resmi mengumumkan pembukaan Pendaftaran Gelombang II Tahun Akademik 2026/2027 untuk seluruh lima Program Studi Sarjana (S1) dan Program Magister (S2 PAI).\n\nTersedia keringanan hingga pembebasan biaya kuliah penuh melalui jalur Beasiswa Unggulan Tahfidz Al-Furqan bagi pendaftar dengan hafalan terverifikasi 5, 10, hingga 30 Juz, serta jalur KIP-Kuliah bagi calon mahasiswa S1 yang memenuhi persyaratan.\n\nWawancara penempatan dan uji baca Al-Qur’an dilaksanakan setiap hari Selasa dan Kamis pukul 09.00 hingga 14.00 WITA di Biro Administrasi Akademik.',
    coverImage: UNIVERSITY_MEDIA.heroCourtyard,
    authorName: 'Biro PMB Kampus',
    status: 'published',
    priority: 'urgent',
    featured: true,
    views: 2140,
    publishedDate: '2026-11-24',
    authorId: 'seed',
  },
  {
    id: 'post-article-tafaqquh-digital',
    title: 'Menghidupkan Tafaqquh Fid-Din: Literasi Kitab Klasik dalam Ruang Kelas Kontemporer',
    slug: 'menghidupkan-tafaqquh-fid-din-literasi-kitab-klasik',
    category: 'article',
    excerpt:
      'Refleksi dosen mengenai perpaduan analisis tekstual bersanad dengan arsip digital terbuka bagi mahasiswa Tarbiyah dan Syariah.',
    content:
      'Di lingkungan perguruan tinggi keagamaan Islam Indonesia, salah satu tantangan akademik terpenting adalah menjembatani ketelitian metodologis khazanah Kitab Kuning dengan pendekatan riset empiris modern.\n\nDi STAI Al-Furqan Makassar, kelas seminar di Fakultas Tarbiyah dan Fakultas Syariah menghadirkan forum kajian komparatif di mana mahasiswa menelaah langsung teks fiqh berbahasa Arab berdampingan dengan putusan Peradilan Agama dan studi kasus pembelajaran madrasah masa kini.\n\nEvaluasi tahun akademik 2025/2026 menunjukkan peningkatan signifikan pada kedalaman referensi skripsi serta ketajaman argumentasi lisan mahasiswa tingkat akhir.',
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
    title: '38 Mahasiswa Lulus Sertifikasi Tahfidz Kampus Menjelang Wisuda Tahunan',
    slug: '38-mahasiswa-lulus-sertifikasi-tahfidz-kampus',
    category: 'news',
    excerpt:
      'Peserta dari prodi PAI, PGMI, dan HKI menuntaskan ujian tasmi’ terbuka di hadapan tim penguji dosen di Pendopo Masjid Kampus.',
    content:
      'Sebanyak tiga puluh delapan mahasiswa program Sarjana dan Pascasarjana meraih Sertifikasi Resmi Tahfidz & Tilawah STAI Al-Furqan setelah menuntaskan rangkaian ujian tasmi’ terbuka selama tiga hari yang dibimbing oleh Pusat Studi Al-Qur’an.\n\nProgram ini melengkapi perkuliahan reguler melalui halaqah harian terbimbing sehingga para lulusan siap memimpin pembinaan Tilawah dan Tahfidz di sekolah maupun masyarakat di seluruh Kawasan Timur Indonesia.',
    coverImage: UNIVERSITY_MEDIA.tahfidzClass,
    authorName: 'Pusat Studi Al-Qur’an',
    status: 'published',
    priority: 'normal',
    featured: false,
    views: 964,
    publishedDate: '2026-11-14',
    authorId: 'seed',
  },
  {
    id: 'post-announcement-kkn-2026',
    title: 'Jadwal Pendaftaran Kuliah Kerja Nyata (KKN Angkatan XXXIV) Tahun 2026',
    slug: 'jadwal-pendaftaran-kkn-angkatan-34-2026',
    category: 'announcement',
    excerpt:
      'Mahasiswa semester VI yang telah menempuh minimal 110 SKS wajib menyelesaikan pendaftaran lokasi KKN sebelum 5 Desember 2026.',
    content:
      'Lembaga Penelitian dan Pengabdian kepada Masyarakat (LP2M) memberitahukan kepada seluruh mahasiswa semester VI yang memenuhi syarat bahwa pendaftaran KKN Angkatan XXXIV telah resmi dibuka.\n\nLokasi penempatan mencakup desa dan kelurahan mitra di Kabupaten Maros, Pangkep, dan Gowa dengan fokus literasi remaja masjid, pendampingan madrasah diniyah, serta klinik sadar hukum keluarga. Pembekalan peserta dilaksanakan di Auditorium Utama pada 10 Desember 2026.',
    coverImage: UNIVERSITY_MEDIA.tahfidzClass,
    authorName: 'LP2M STAI Al-Furqan',
    status: 'published',
    priority: 'important',
    featured: false,
    views: 1105,
    publishedDate: '2026-11-20',
    authorId: 'seed',
  },
  {
    id: 'post-article-family-mediation',
    title: 'Mediasi Keluarga Preventif di Sulawesi Selatan: Catatan dari Klinik Lapangan Syariah',
    slug: 'mediasi-keluarga-preventif-sulawesi-selatan',
    category: 'article',
    excerpt:
      'Bagaimana kolaborasi praktikum mahasiswa HKI bersama KUA setempat memperkuat literasi bimbingan pranikah masyarakat.',
    content:
      'Laporan praktikum lapangan yang dihimpun mahasiswa Hukum Keluarga Islam (HKI) selama dua semester terakhir menegaskan peran strategis bimbingan pranikah terstruktur dalam membangun ketahanan keluarga.\n\nDi bawah supervisi dosen bersama Kantor Urusan Agama (KUA) Kecamatan Biringkanaya dan Tamalanrea, mahasiswa menyusun modul edukasi berbahasa Indonesia dan Bugis-Makassar mengenai hak-hak keluarga, pengelolaan ekonomi rumah tangga, serta penyelesaian sengketa secara damai.',
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
    title: 'Open House Kampus & Konsultasi PMB Gelombang II',
    eventDate: '2026-12-03',
    timeRange: '08.30 – 14.00 WITA',
    location: 'Aula Rektorat & Pelataran Kampus Daya',
    organizer: 'Biro PMB STAI Al-Furqan',
    category: 'admissions',
    description:
      'Tur fasilitas kampus, konsultasi pemilihan program studi S1 dan S2 bersama dosen, serta verifikasi langsung berkas Beasiswa Tahfidz.',
    status: 'upcoming',
    active: true,
    authorId: 'seed',
  },
  {
    id: 'agenda-kkn-briefing',
    title: 'Pembekalan & Pelepasan Peserta KKN Angkatan XXXIV',
    eventDate: '2026-12-10',
    timeRange: '09.00 – 12.30 WITA',
    location: 'Auditorium Utama, Lantai 2',
    organizer: 'LP2M STAI Al-Furqan',
    category: 'academic',
    description:
      'Pembekalan wajib meliputi etika pengabdian masyarakat, format pelaporan program kerja, serta koordinasi bersama dosen pembimbing lapangan.',
    status: 'upcoming',
    active: true,
    authorId: 'seed',
  },
  {
    id: 'agenda-postgrad-colloquium',
    title: 'Kolokium Seminar Proposal Tesis Pascasarjana (S2 PAI)',
    eventDate: '2026-12-15',
    timeRange: '13.00 – 17.00 WITA',
    location: 'Ruang Seminar Pascasarjana B2',
    organizer: 'Program Pascasarjana',
    category: 'seminar',
    description:
      'Sidang terbuka pemaparan proposal penelitian kualitatif dan metode campuran oleh mahasiswa semester III Magister Pendidikan Agama Islam.',
    status: 'upcoming',
    active: true,
    authorId: 'seed',
  },
  {
    id: 'agenda-mtq-campus',
    title: 'Musabaqah Tilawatil Qur’an (MTQ) Tahunan Antar-Fakultas',
    eventDate: '2026-12-21',
    timeRange: '08.00 – 16.30 WITA',
    location: 'Pendopo Masjid Kampus Al-Furqan',
    organizer: 'BEM & LPTQ Kampus',
    category: 'student-life',
    description:
      'Perlombaan cabang Tilawah, Hifdzil Qur’an (5 & 10 Juz), Syarhil Qur’an, serta Kaligrafi Islam tingkat mahasiswa.',
    status: 'upcoming',
    active: true,
    authorId: 'seed',
  },
  {
    id: 'agenda-uas-schedule',
    title: 'Ujian Akhir Semester (UAS) Ganjil 2026/2027',
    eventDate: '2027-01-11',
    timeRange: '08.00 – 15.30 WITA',
    location: 'Gedung Kuliah Tarbiyah, Syariah & Dakwah',
    organizer: 'Biro Administrasi Akademik',
    category: 'academic',
    description:
      'Pelaksanaan ujian tertulis dan lisan akhir semester bagi seluruh mata kuliah jenjang Sarjana (S1) dan Pascasarjana (S2).',
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
    role: 'Wakil Kepala Madrasah Bidang Akademik',
    organization: 'MAN 2 Kota Makassar',
    quote:
      'Menyelesaikan tesis magister di STAI Al-Furqan mengubah cara saya merancang pembinaan guru. Dalam setahun setelah lulus, madrasah kami mengadopsi rubrik penilaian Tahfidz terstruktur yang bersumber langsung dari riset pascasarjana saya.',
    featured: true,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'alumni-muh-syahrul',
    name: 'Muhammad Syahrul, S.H',
    graduationYear: 2021,
    program: 'S1 Hukum Keluarga Islam',
    role: 'Mediator Keluarga Tersertifikasi',
    organization: 'Pengadilan Agama Sungguminasa',
    quote:
      'Perpaduan kajian fiqh klasik dan praktikum langsung di Peradilan Agama membuat saya siap mengabdi sejak hari pertama. Para dosen membimbing kami menyusun analisis hukum yang jernih sekaligus mengedepankan mediasi yang humanis.',
    featured: true,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'alumni-andi-fitriani',
    name: 'Andi Fitriani, S.Pd',
    graduationYear: 2023,
    program: 'S1 Pendidikan Guru Madrasah Ibtidaiyah',
    role: 'Guru Utama Pendidikan Dasar',
    organization: 'SDIT Al-Biruni Mandiri Makassar',
    quote:
      'Laboratorium micro-teaching dan pembinaan Tilawah harian di Kampus Daya memberi kepercayaan diri nyata di depan kelas. Hampir seluruh rekan seangkatan saya diterima mengajar dalam empat bulan setelah wisuda.',
    featured: true,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'alumni-rahmatullah',
    name: 'Rahmatullah, S.Sos',
    graduationYear: 2020,
    program: 'S1 Bimbingan & Penyuluhan Islam',
    role: 'Koordinator Penyuluh Pemuda',
    organization: 'Kementerian Agama Kab. Maros',
    quote:
      'STAI Al-Furqan mengajarkan saya mendengar masyarakat dengan empati serta melayani warga Sulawesi Selatan dengan kearifan budaya, etika keislaman yang kokoh, dan komunikasi publik yang tertata.',
    featured: false,
    active: true,
    authorId: 'seed',
  },
];

export const DEFAULT_NOTIFICATIONS: CampusNotification[] = [
  {
    id: 'notif-admissions-wave-2',
    title: 'PMB Gelombang II & Beasiswa Tahfidz Dibuka',
    message:
      'Pendaftaran daring dan langsung di kampus untuk jenjang S1 dan S2 dibuka hingga 18 Desember 2026.',
    type: 'urgent',
    targetSection: 'news',
    active: true,
    authorId: 'seed',
    createdAtMs: Date.now() - 1000 * 60 * 35,
  },
  {
    id: 'notif-open-house',
    title: 'Open House Kampus Daya — 3 Desember',
    message:
      'Kunjungi Kampus Daya untuk konsultasi program studi, tur perpustakaan, dan verifikasi beasiswa.',
    type: 'agenda',
    targetSection: 'agenda',
    active: true,
    authorId: 'seed',
    createdAtMs: Date.now() - 1000 * 60 * 180,
  },
  {
    id: 'notif-kkn-deadline',
    title: 'Batas Akhir Pendaftaran KKN Angkatan XXXIV',
    message:
      'Mahasiswa semester VI yang memenuhi syarat wajib melengkapi formulir penempatan LP2M sebelum 5 Desember 2026.',
    type: 'announcement',
    targetSection: 'news',
    active: true,
    authorId: 'seed',
    createdAtMs: Date.now() - 1000 * 60 * 420,
  },
];

export const DEFAULT_DAILY_ANALYTICS: DailyAnalytics[] = [
  { id: 'day-2026-11-13', dateLabel: '13 Nov', isoDate: '2026-11-13', visitors: 312, pageViews: 840, searches: 94, programViews: 178, mobileShare: 68, authorId: 'seed' },
  { id: 'day-2026-11-14', dateLabel: '14 Nov', isoDate: '2026-11-14', visitors: 289, pageViews: 765, searches: 81, programViews: 152, mobileShare: 71, authorId: 'seed' },
  { id: 'day-2026-11-15', dateLabel: '15 Nov', isoDate: '2026-11-15', visitors: 264, pageViews: 710, searches: 77, programViews: 141, mobileShare: 74, authorId: 'seed' },
  { id: 'day-2026-11-16', dateLabel: '16 Nov', isoDate: '2026-11-16', visitors: 428, pageViews: 1185, searches: 146, programViews: 264, mobileShare: 64, authorId: 'seed' },
  { id: 'day-2026-11-17', dateLabel: '17 Nov', isoDate: '2026-11-17', visitors: 465, pageViews: 1310, searches: 162, programViews: 295, mobileShare: 65, authorId: 'seed' },
  { id: 'day-2026-11-18', dateLabel: '18 Nov', isoDate: '2026-11-18', visitors: 510, pageViews: 1440, searches: 185, programViews: 320, mobileShare: 66, authorId: 'seed' },
  { id: 'day-2026-11-19', dateLabel: '19 Nov', isoDate: '2026-11-19', visitors: 482, pageViews: 1352, searches: 174, programViews: 304, mobileShare: 67, authorId: 'seed' },
  { id: 'day-2026-11-20', dateLabel: '20 Nov', isoDate: '2026-11-20', visitors: 538, pageViews: 1560, searches: 210, programViews: 348, mobileShare: 69, authorId: 'seed' },
  { id: 'day-2026-11-21', dateLabel: '21 Nov', isoDate: '2026-11-21', visitors: 412, pageViews: 1120, searches: 148, programViews: 256, mobileShare: 73, authorId: 'seed' },
  { id: 'day-2026-11-22', dateLabel: '22 Nov', isoDate: '2026-11-22', visitors: 594, pageViews: 1745, searches: 238, programViews: 392, mobileShare: 72, authorId: 'seed' },
  { id: 'day-2026-11-23', dateLabel: '23 Nov', isoDate: '2026-11-23', visitors: 640, pageViews: 1920, searches: 264, programViews: 440, mobileShare: 66, authorId: 'seed' },
  { id: 'day-2026-11-24', dateLabel: '24 Nov', isoDate: '2026-11-24', visitors: 718, pageViews: 2180, searches: 312, programViews: 515, mobileShare: 68, authorId: 'seed' },
  { id: 'day-2026-11-25', dateLabel: '25 Nov', isoDate: '2026-11-25', visitors: 685, pageViews: 2040, searches: 289, programViews: 482, mobileShare: 70, authorId: 'seed' },
  { id: 'day-2026-11-26', dateLabel: '26 Nov', isoDate: '2026-11-26', visitors: 742, pageViews: 2290, searches: 334, programViews: 548, mobileShare: 69, authorId: 'seed' },
];

export const DEFAULT_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'gal-courtyard-morning',
    title: 'Suasana Pagi di Pelataran Kampus Daya',
    caption:
      'Mahasiswa melangkah di selasar utama berhadapan dengan Masjid Kampus Al-Furqan menjelang perkuliahan pagi di Daya, Makassar.',
    category: 'campus',
    imageUrl: UNIVERSITY_MEDIA.heroCourtyard,
    photographer: 'Unit Media Kampus',
    displayOrder: 0,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'gal-graduation-procession',
    title: 'Prosesi Wisuda Tahunan & Kebahagiaan Keluarga',
    caption:
      'Para wisudawan program S1 dan S2 merayakan momen kelulusan bersama keluarga di pelataran utama usai rapat senat terbuka.',
    category: 'events',
    imageUrl: UNIVERSITY_MEDIA.graduationCourtyard,
    photographer: 'Humas STAI Al-Furqan',
    displayOrder: 1,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'gal-student-colonnade',
    title: 'Lingkar Diskusi & Riset Mahasiswa Lintas Prodi',
    caption:
      'Mahasiswa Fakultas Tarbiyah dan Syariah berkolaborasi menyusun laporan penelitian lapangan dan modul edukasi di selasar teduh kampus.',
    category: 'student-life',
    imageUrl: UNIVERSITY_MEDIA.studentCollaboration,
    photographer: 'Lembaga Pers Mahasiswa',
    displayOrder: 2,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'gal-central-library',
    title: 'Perpustakaan Pusat & Ruang Khazanah Kitab Klasik',
    caption:
      'Suasana belajar tenang di ruang baca utama yang menghimpun koleksi Kitab Kuning, jurnal ilmiah nasional, dan repositori skripsi.',
    category: 'academics',
    imageUrl: UNIVERSITY_MEDIA.libraryHall,
    photographer: 'Tim Perpustakaan Pusat',
    displayOrder: 3,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'gal-tahfidz-halaqah',
    title: 'Halaqah Tilawah & Pembinaan Tahfidzul Qur’an',
    caption:
      'Pembinaan rutin kelompok kecil hafalan dan tartil Al-Qur’an bersama dosen pembimbing di pendopo taman kampus.',
    category: 'student-life',
    imageUrl: UNIVERSITY_MEDIA.tahfidzClass,
    photographer: 'Pusat Studi Al-Qur’an',
    displayOrder: 4,
    active: true,
    authorId: 'seed',
  },
  {
    id: 'gal-national-symposium',
    title: 'Simposium Pedagogi Islam Kawasan Timur Indonesia',
    caption:
      'Sesi pemaparan utama di Auditorium Utama yang mempertemukan akademisi, pimpinan pesantren, dan mahasiswa pascasarjana.',
    category: 'events',
    imageUrl: UNIVERSITY_MEDIA.symposiumHall,
    photographer: 'Unit Media Kampus',
    displayOrder: 5,
    active: true,
    authorId: 'seed',
  },
];
