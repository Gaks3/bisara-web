import api from "./api-client";
import { authClient } from "./auth-client";

/* ================= TYPES ================= */

// Base API Response format
export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  error?: {
    message: string;
    code?: string;
  };
}

// User Profile & Dashboard
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  city: string | null;
  roleTitle: string | null;
  image: string | null;
  isVerified?: boolean;
}

export interface StreakInfo {
  currentDays: number;
  longestDays: number;
  lastActivityDate: string | null;
}

export interface DailyTargetInfo {
  completedMinutes: number;
  targetMinutes: number;
}

export interface ProgressLevel {
  levelCode: number;
  title: string;
  progressPercent: number;
  score: number;
}

export interface ActivityDay {
  date: string;
  minutes: number;
}

export interface DashboardData {
  user: UserInfo;
  score: number;
  streak: StreakInfo;
  dailyTarget: DailyTargetInfo;
  masteredSignsCount: number;
  progress: ProgressLevel[];
  activity: ActivityDay[];
}

// Leaderboard
export interface LeaderboardEntry {
  rank: number;
  score: number;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  period: "DAILY" | "WEEKLY" | "MONTHLY" | "ALL_TIME" | string;
}

// Learning Catalog
export interface CatalogCategory {
  name: string;
  slug: string;
  type: string;
  description: string;
  icon: string;
}

export interface CatalogLessonSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  progressPercent: number;
  totalExercises: number;
  completedExercises: number;
  locked: boolean;
  category: {
    name: string;
    slug: string;
    type: string;
  };
}

export interface CatalogLevel {
  code: number;
  title: string;
  description: string;
  status: "ACTIVE" | "OPEN" | "LOCKED" | string;
  isLocked: boolean;
  progressPercent: number;
  actionText: string;
  lessons: CatalogLessonSummary[];
}

export interface LearningCatalogData {
  categories: CatalogCategory[];
  levels: CatalogLevel[];
}

// Sign and Media
export interface SignMedia {
  type: string;
  url: string;
  thumbnail: string | null;
  duration: number | null;
}

export interface SignData {
  code: string;
  word: string;
  meaning: string;
  description?: string | null;
  difficulty?: number;
  media?: SignMedia[];
}

// Lesson Materials & Exercises
export interface LessonMaterial {
  id: string;
  title: string;
  type: string;
  order: number;
  content: string | null;
  mediaUrl: string | null;
  score: number;
  sign: SignData | null;
}

export interface ExerciseOption {
  id: string;
  label: string;
  sign: SignData | null;
}

export interface ExerciseItem {
  id: string;
  type: "GUESS_MEANING" | "GESTURE_PRACTICE" | "MULTIPLE_CHOICE" | string;
  prompt: string;
  instruction: string | null;
  passingScore: number;
  maxScore: number;
  mediaUrl: string | null;
  sign: SignData | null;
  order?: number;
  options: ExerciseOption[];
  cvConfig?: {
    confidenceThreshold: number;
    detectionMode: string;
    holdTimeMs: number;
    targetSign: {
      code: string;
      meaning: string;
      word: string;
      media?: SignMedia[];
    };
  } | null;
}

export interface LessonDetailData {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: {
    code: number;
    title: string;
  };
  category: {
    name: string;
    slug: string;
    type: string;
  };
  materials: LessonMaterial[];
  exercises: ExerciseItem[];
}

// Exercise Attempt
export interface AttemptRequest {
  exerciseId: string;
  status: "COMPLETED" | "FAILED";
  score: number;
  accuracy?: number;
  durationMs?: number;
  feedback?: string;
  selectedOption?: string;
  detectedSignId?: string;
  detectionData?: Record<string, unknown>;
}

export interface AttemptData {
  id: string;
  status: "COMPLETED" | "FAILED";
  score: number;
  accuracy: number;
  feedback: string;
  awardedXp: number;
  totalScore: number;
  progress: {
    lessonId: string;
    levelId?: string;
    completedExercises: number;
    totalExercises: number;
    progressPercent: number;
  };
  streak: StreakInfo;
  newAchievements: Array<{
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    isUnlocked: boolean;
  }>;
}

// Profile
export interface AchievementItem {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  iconUrl: string | null;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface PracticeHistoryItem {
  id: string;
  title: string;
  date: string;
  timeAgo: string;
  itemCountText: string;
  xpGained: number;
  badge: string;
}

export interface UserPreferences {
  dailyReminder: boolean;
  dyslexiaFont: boolean;
  highContrast: boolean;
  reminderTime: string;
}

export interface LevelProgressInfo {
  currentLevel: number;
  currentLevelTitle: string;
  currentLevelXp: number;
  nextLevelTitle: string;
  nextLevelXp: number;
  progressPercent: number;
  remainingXp: number;
}

export interface ProfileData {
  user: UserInfo;
  stats: {
    totalXp: number;
    streakDays: number;
    masteredSignsCount: number;
    discussionCount: number;
  };
  levelProgress: LevelProgressInfo;
  achievements: {
    totalCount: number;
    unlockedCount: number;
    list: AchievementItem[];
  };
  practiceHistory: PracticeHistoryItem[];
  preferences: UserPreferences;
  savedItemsCount: number;
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  city?: string;
  image?: string;
  preferences?: Partial<UserPreferences>;
}

/* ================= DEFAULT FALLBACKS (FROM OPENAPI SPEC) ================= */

export const FALLBACK_DASHBOARD: DashboardData = {
  score: 1250,
  masteredSignsCount: 48,
  dailyTarget: {
    completedMinutes: 15,
    targetMinutes: 20,
  },
  streak: {
    currentDays: 7,
    lastActivityDate: new Date().toISOString(),
    longestDays: 12,
  },
  user: {
    id: "user_123",
    name: "You",
    email: "you@example.com",
    bio: "Belajar BISINDO untuk komunikasi tanpa batas.",
    city: "Yogyakarta",
    roleTitle: "Pembelajar Inklusif",
    image: null,
  },
  progress: [
    {
      levelCode: 1,
      title: "Level 1: Abjad Ejaan Jari",
      progressPercent: 80,
      score: 450,
    },
    {
      levelCode: 2,
      title: "Level 2: Angka & Hitungan",
      progressPercent: 35,
      score: 280,
    },
  ],
  activity: [
    { date: "2026-10-10", minutes: 20 },
    { date: "2026-10-11", minutes: 15 },
    { date: "2026-10-12", minutes: 25 },
    { date: "2026-10-13", minutes: 20 },
    { date: "2026-10-14", minutes: 30 },
    { date: "2026-10-15", minutes: 15 },
  ],
};

export const FALLBACK_LEADERBOARD: LeaderboardData = {
  period: "WEEKLY",
  entries: [
    {
      rank: 1,
      score: 2500,
      user: {
        id: "user_1",
        name: "Siti Rahma",
        image: null,
      },
    },
    {
      rank: 2,
      score: 1250,
      user: {
        id: "user_123",
        name: "You",
        image: null,
      },
    },
    {
      rank: 3,
      score: 980,
      user: {
        id: "user_3",
        name: "Andi Wijaya",
        image: null,
      },
    },
    {
      rank: 4,
      score: 720,
      user: {
        id: "user_4",
        name: "Budi Santoso",
        image: null,
      },
    },
  ],
};

export const FALLBACK_CATALOG: LearningCatalogData = {
  categories: [
    {
      name: "Abjad A-Z",
      slug: "abjad",
      type: "ALPHABET",
      description: "Huruf Bahasa Isyarat Indonesia",
      icon: "A",
    },
    {
      name: "Kata Sehari-hari",
      slug: "kata-sehari-hari",
      type: "DAILY",
      description: "Salam, terima kasih & ungkapan lazim",
      icon: "💬",
    },
    {
      name: "Angka & Hitungan",
      slug: "angka",
      type: "NUMBER",
      description: "Angka dan satuan waktu",
      icon: "0",
    },
  ],
  levels: [
    {
      code: 1,
      title: "Level 1: Abjad Ejaan Jari",
      description: "Materi dasar BISINDO ejaan jari tangan",
      status: "ACTIVE",
      isLocked: false,
      progressPercent: 80,
      actionText: "Lanjut",
      lessons: [
        {
          id: "cmv92jxmn0012kwwavzu9x5vk",
          slug: "modul-abjad-a-z",
          title: "Modul Abjad BISINDO A-Z",
          description: "Materi belajar huruf isyarat dasar BISINDO A-Z secara visual dan interaktif.",
          progressPercent: 0,
          totalExercises: 2,
          completedExercises: 0,
          locked: false,
          category: {
            name: "Abjad A-Z",
            slug: "abjad",
            type: "ALPHABET",
          },
        },
        {
          id: "lesson_2",
          slug: "alphabet-lanjutan",
          title: "Abjad Lanjutan N - Z",
          description: "Mengenal bentuk jari tangan untuk huruf N sampai Z",
          progressPercent: 40,
          totalExercises: 5,
          completedExercises: 2,
          locked: false,
          category: {
            name: "Abjad",
            slug: "abjad",
            type: "ALPHABET",
          },
        },
      ],
    },
    {
      code: 2,
      title: "Level 2: Kata Sehari-hari",
      description: "Salam, ungkapan sopan santun, dan bantuan",
      status: "OPEN",
      isLocked: false,
      progressPercent: 20,
      actionText: "Mulai",
      lessons: [
        {
          id: "lesson_3",
          slug: "salam-sapaan",
          title: "Salam & Ungkapan Hangat",
          description: "Halo, selamat pagi, terima kasih, maaf",
          progressPercent: 20,
          totalExercises: 4,
          completedExercises: 1,
          locked: false,
          category: {
            name: "Kata Sehari-hari",
            slug: "kata-sehari-hari",
            type: "DAILY",
          },
        },
      ],
    },
    {
      code: 3,
      title: "Level 3: Angka & Waktu",
      description: "Hitungan angka 1-100 dan penunjuk waktu",
      status: "LOCKED",
      isLocked: true,
      progressPercent: 0,
      actionText: "Terkunci",
      lessons: [],
    },
  ],
};

export const FALLBACK_LESSON_DETAIL: LessonDetailData = {
  id: "cmv92jxmn0012kwwavzu9x5vk",
  title: "Modul Abjad BISINDO A-Z",
  slug: "modul-abjad-a-z",
  description: "Materi belajar huruf isyarat dasar BISINDO A-Z secara visual dan interaktif.",
  level: {
    code: 1,
    title: "Level 1: Abjad Ejaan Jari",
  },
  category: {
    name: "Abjad A-Z",
    slug: "abjad",
    type: "ALPHABET",
  },
  materials: [
    {
      id: "cmv92jyyw0015kwwaa5kxln40",
      title: "Flashcard & Player Isyarat (BISINDO Standar)",
      type: "SIGN",
      order: 1,
      content: "Flashcard interaktif huruf 'A' sesuai standar BISINDO.",
      mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
      score: 10,
      sign: {
        code: "A",
        word: "Huruf 'A'",
        meaning: "Huruf A",
        description: "Kepalkan tangan dengan ibu jari berada tegak di samping jari telunjuk.",
        difficulty: 1,
        media: [
          {
            duration: 3,
            thumbnail: "https://res.cloudinary.com/dtz0urit6/image/upload/q_auto:best,f_jpg/cloudinary-tools-uploads/dt5ra2velg1s5rdd417r",
            type: "IMAGE",
            url: "https://res.cloudinary.com/dtz0urit6/image/upload/q_auto:best,f_jpg/cloudinary-tools-uploads/dt5ra2velg1s5rdd417r",
          },
        ],
      },
    },
    {
      id: "cmv92jz1q0016kwwa1eomvm54",
      title: "Video Peraga",
      type: "VIDEO",
      order: 2,
      content: "Video peraga isyarat gerak tangan TERIMA KASIH dengan opsi perlambat 0.5x.",
      mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      score: 10,
      sign: {
        code: "TERIMA_KASIH",
        word: "TERIMA KASIH",
        meaning: "Ungkapan terima kasih",
        description: "Sentuhkan ujung jari tangan kanan ke bibir/dagu, lalu gerakkan tangan ke depan secara terbuka.",
        difficulty: 1,
        media: [
          {
            duration: 3,
            thumbnail: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=500",
            type: "IMAGE",
            url: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=500",
          },
        ],
      },
    },
  ],
  exercises: [
    {
      id: "cmv92jz6t0017kwwaytmu2vrj",
      type: "GUESS_MEANING",
      prompt: "Apakah arti gestur isyarat berikut ini?",
      instruction: "Pilih salah satu arti isyarat yang paling tepat sesuai demonstrasi gestur.",
      maxScore: 50,
      passingScore: 70,
      mediaUrl: "https://res.cloudinary.com/dtz0urit6/image/upload/q_auto:best,f_jpg/cloudinary-tools-uploads/dt5ra2velg1s5rdd417r",
      order: 1,
      sign: {
        code: "HALO",
        word: "HALO",
        meaning: "Salam sapaan ramah",
        description: "Buka telapak tangan Anda setinggi dada lalu lambaikan perlahan ke samping.",
      },
      options: [
        {
          id: "cmv92jzag0018kwwanu87lp0i",
          label: "A. Halo / Salam",
          sign: {
            code: "HALO",
            word: "HALO",
            meaning: "Salam sapaan ramah",
          },
        },
        {
          id: "cmv92jzag0019kwwagvr4k6fg",
          label: "B. Saya Cinta Kamu",
          sign: {
            code: "CINTA",
            word: "SAYA CINTA KAMU",
            meaning: "Saya Cinta Kamu",
          },
        },
        {
          id: "cmv92jzah001akwwawlnjf8a6",
          label: "C. Terima Kasih",
          sign: {
            code: "TERIMA_KASIH",
            word: "TERIMA KASIH",
            meaning: "Ungkapan terima kasih",
          },
        },
        {
          id: "cmv92jzah001bkwwahmfkyca9",
          label: "D. Maaf",
          sign: {
            code: "MAAF",
            word: "MAAF",
            meaning: "Permohonan maaf",
          },
        },
      ],
      cvConfig: null,
    },
    {
      id: "cmv92jzfv001ckwwa2i7x1o7w",
      type: "AI_PRACTICE",
      prompt: "Coba peragakan kata \"HALO\" di depan kamera!",
      instruction: "Buka telapak tangan Anda setinggi dada lalu lambaikan perlahan ke samping.",
      maxScore: 50,
      passingScore: 85,
      mediaUrl: null,
      order: 2,
      sign: {
        code: "HALO",
        word: "HALO",
        meaning: "Salam sapaan ramah",
        description: "Buka telapak tangan Anda setinggi dada lalu lambaikan perlahan ke samping.",
      },
      options: [],
      cvConfig: {
        confidenceThreshold: 0.85,
        detectionMode: "HAND_POSITION",
        holdTimeMs: 1500,
        targetSign: {
          code: "HALO",
          word: "HALO",
          meaning: "Salam sapaan ramah",
        },
      },
    },
  ],
};

export const FALLBACK_PROFILE: ProfileData = {
  user: {
    id: "user_123",
    name: "You",
    email: "you@example.com",
    bio: "Belajar BISINDO untuk komunikasi tanpa batas.",
    city: "Yogyakarta",
    roleTitle: "Pembelajar Inklusif",
    image: null,
    isVerified: true,
  },
  stats: {
    totalXp: 1250,
    streakDays: 7,
    masteredSignsCount: 48,
    discussionCount: 12,
  },
  levelProgress: {
    currentLevel: 4,
    currentLevelTitle: "Pejuang Isyarat",
    currentLevelXp: 750,
    nextLevelTitle: "Master BISINDO",
    nextLevelXp: 1000,
    progressPercent: 75,
    remainingXp: 250,
  },
  achievements: {
    totalCount: 4,
    unlockedCount: 3,
    list: [
      {
        id: "ach_1",
        code: "MASTER_ABJAD",
        name: "Master Abjad",
        description: "Selesaikan semua huruf isyarat dasar BISINDO A-Z",
        icon: "check",
        iconUrl: null,
        isUnlocked: true,
        unlockedAt: "2026-10-12T00:00:00.000Z",
      },
      {
        id: "ach_2",
        code: "API_KONSISTEN",
        name: "Api Konsisten",
        description: "Pertahankan streak belajar selama 7 hari berturut-turut",
        icon: "flame",
        iconUrl: null,
        isUnlocked: true,
        unlockedAt: "2026-10-14T00:00:00.000Z",
      },
      {
        id: "ach_3",
        code: "TEMAN_INKLUSIF",
        name: "Teman Inklusif",
        description: "Ikuti diskusi komunitas dan bagikan modul isyarat",
        icon: "users",
        iconUrl: null,
        isUnlocked: true,
        unlockedAt: "2026-10-13T00:00:00.000Z",
      },
      {
        id: "ach_4",
        code: "AI_DETEKSI",
        name: "AI Deteksi",
        description: "Berhasil melewati 5 kali latihan kamera AI dengan akurasi di atas 90%",
        icon: "scan",
        iconUrl: null,
        isUnlocked: false,
        unlockedAt: null,
      },
    ],
  },
  practiceHistory: [
    {
      id: "hist_1",
      badge: "AZ",
      title: "Modul Abjad BISINDO A-Z",
      date: "2026-10-14T10:00:00.000Z",
      timeAgo: "Kemarin",
      itemCountText: "15 Kosakata",
      xpGained: 50,
    },
    {
      id: "hist_2",
      badge: "S",
      title: "Sapaan & Salam Sehari-hari",
      date: "2026-10-12T10:00:00.000Z",
      timeAgo: "3 hari lalu",
      itemCountText: "8 Isyarat",
      xpGained: 30,
    },
  ],
  preferences: {
    dailyReminder: true,
    dyslexiaFont: false,
    highContrast: false,
    reminderTime: "19:00 WIB",
  },
  savedItemsCount: 3,
};

/* ================= SERVICE FUNCTIONS ================= */

export const apiService = {
  /** GET /api/dashboard */
  async getDashboard(): Promise<DashboardData> {
    try {
      const res = await api.get<ApiResponse<DashboardData>>("/api/dashboard");
      if (res.data?.data) {
        return res.data.data;
      }
      return FALLBACK_DASHBOARD;
    } catch (err) {
      console.warn("Using fallback for dashboard:", err);
      return FALLBACK_DASHBOARD;
    }
  },

  /** GET /api/learning/catalog */
  async getLearningCatalog(): Promise<LearningCatalogData> {
    try {
      const res = await api.get<ApiResponse<LearningCatalogData>>("/api/learning/catalog");
      if (res.data?.data) {
        return res.data.data;
      }
      return FALLBACK_CATALOG;
    } catch (err) {
      console.warn("Using fallback for catalog:", err);
      return FALLBACK_CATALOG;
    }
  },

  /** GET /api/learning/lessons/:slug */
  async getLessonDetail(slug: string): Promise<LessonDetailData> {
    try {
      const res = await api.get<ApiResponse<LessonDetailData>>(`/api/learning/lessons/${slug}`);
      if (res.data?.data) {
        return res.data.data;
      }
      return { ...FALLBACK_LESSON_DETAIL, slug };
    } catch (err) {
      console.warn(`Using fallback for lesson ${slug}:`, err);
      return { ...FALLBACK_LESSON_DETAIL, slug };
    }
  },

  /** GET /api/learning/exercises/:id */
  async getExerciseDetail(id: string): Promise<ExerciseItem> {
    try {
      const res = await api.get<ApiResponse<ExerciseItem>>(`/api/learning/exercises/${id}`);
      if (res.data?.data) {
        return res.data.data;
      }
      return FALLBACK_LESSON_DETAIL.exercises[0];
    } catch (err) {
      console.warn(`Using fallback for exercise ${id}:`, err);
      return FALLBACK_LESSON_DETAIL.exercises[0];
    }
  },

  /** POST /api/learning/attempts */
  async submitAttempt(payload: AttemptRequest): Promise<AttemptData> {
    try {
      const res = await api.post<ApiResponse<AttemptData>>("/api/learning/attempts", payload);
      if (res.data?.data) {
        return res.data.data;
      }
      throw new Error("Invalid response");
    } catch (err) {
      console.warn("Using mock response for attempt submission:", err);
      // Return simulated success attempt
      return {
        id: "attempt_" + Date.now(),
        status: payload.status,
        score: payload.score,
        accuracy: payload.accuracy || 0.95,
        feedback: payload.feedback || "Gerakan terdeteksi dengan sangat baik! Terus pertahankan.",
        awardedXp: 50,
        totalScore: 1300,
        progress: {
          lessonId: "alphabet-dasar",
          completedExercises: 2,
          totalExercises: 2,
          progressPercent: 100,
        },
        streak: {
          currentDays: 7,
          longestDays: 12,
          lastActivityDate: new Date().toISOString(),
        },
        newAchievements: [],
      };
    }
  },

  /** GET /api/profile */
  async getProfile(): Promise<ProfileData> {
    try {
      const res = await api.get<ApiResponse<ProfileData>>("/api/profile");
      if (res.data?.data) {
        return res.data.data;
      }
      return FALLBACK_PROFILE;
    } catch (err) {
      console.warn("Using fallback for profile:", err);
      return FALLBACK_PROFILE;
    }
  },

  /** PATCH /api/profile/update */
  async updateProfile(payload: UpdateProfileRequest): Promise<ProfileData> {
    try {
      const res = await api.patch<ApiResponse<ProfileData>>("/api/profile/update", payload);
      if (res.data?.data) {
        return res.data.data;
      }
      return FALLBACK_PROFILE;
    } catch (err) {
      console.warn("Using local update fallback for profile:", err);
      return {
        ...FALLBACK_PROFILE,
        user: {
          ...FALLBACK_PROFILE.user,
          name: payload.name ?? FALLBACK_PROFILE.user.name,
          bio: payload.bio ?? FALLBACK_PROFILE.user.bio,
          city: payload.city ?? FALLBACK_PROFILE.user.city,
        },
        preferences: {
          ...FALLBACK_PROFILE.preferences,
          ...(payload.preferences || {}),
        },
      };
    }
  },

  /** GET /api/leaderboard?period=WEEKLY&limit=10 */
  async getLeaderboard(
    period: "DAILY" | "WEEKLY" | "MONTHLY" | "ALL_TIME" = "WEEKLY",
    limit: number = 10,
  ): Promise<LeaderboardData> {
    try {
      const res = await api.get<ApiResponse<LeaderboardData>>("/api/leaderboard", {
        params: { period, limit },
      });
      if (res.data?.data) {
        return res.data.data;
      }
      return FALLBACK_LEADERBOARD;
    } catch (err) {
      console.warn("Using fallback for leaderboard:", err);
      return FALLBACK_LEADERBOARD;
    }
  },

  /** GET /api/streak/current */
  async getCurrentStreak(): Promise<StreakInfo> {
    try {
      const res = await api.get<ApiResponse<StreakInfo>>("/api/streak/current");
      if (res.data?.data) {
        return res.data.data;
      }
      return FALLBACK_DASHBOARD.streak;
    } catch (err) {
      console.warn("Using fallback for streak:", err);
      return FALLBACK_DASHBOARD.streak;
    }
  },

  /** POST /api/streak/activity */
  async recordStreakActivity(minutes: number): Promise<StreakInfo> {
    try {
      const res = await api.post<ApiResponse<StreakInfo>>("/api/streak/activity", { minutes });
      if (res.data?.data) {
        return res.data.data;
      }
      return {
        currentDays: 8,
        longestDays: 12,
        lastActivityDate: new Date().toISOString(),
      };
    } catch (err) {
      console.warn("Using mock streak update:", err);
      return {
        currentDays: 8,
        longestDays: 12,
        lastActivityDate: new Date().toISOString(),
      };
    }
  },

  /** Auth helper: sign in with email */
  async signInEmail({
    email,
    password,
    rememberMe = true,
  }: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) {
    // Attempt via direct post or authClient
    try {
      const res = await api.post("/api/auth/sign-in/email", {
        email,
        password,
        rememberMe,
      });
      if (res.data?.token) {
        localStorage.setItem("bisara_token", res.data.token);
        localStorage.setItem("token", res.data.token);
        document.cookie = `session_token=${res.data.token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `better-auth.session_token=${res.data.token}; path=/; max-age=604800; SameSite=Lax`;
      }
      return res.data;
    } catch (err) {
      // Try with better-auth client
      const authRes = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });
      return authRes;
    }
  },

  /** Auth helper: logout */
  async signOut() {
    try {
      await authClient.signOut();
    } catch (e) {
      // ignore
    }
    try {
      await api.post("/api/auth/sign-out", {});
    } catch (e) {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("bisara_token");
      localStorage.removeItem("token");
      localStorage.removeItem("auth_token");
      document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "better-auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },
};
