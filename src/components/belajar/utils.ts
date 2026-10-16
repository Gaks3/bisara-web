import { Level } from "./types";
import { LessonMaterial, ExerciseItem } from "@/lib/api-service";

/* Level dianggap selesai jika:
   - status === "COMPLETED", ATAU
   - progress level dari API sudah 100%, ATAU
   - semua lesson di dalamnya sudah 100% */
export const isLevelDone = (level: Level): boolean => {
  if (level.status === "COMPLETED") return true;
  if ((level.progressPercent || 0) >= 100) return true;
  const lessons = level.lessons || [];
  return (
    lessons.length > 0 &&
    lessons.every(
      (l) =>
        (l.progressPercent || 0) >= 100 ||
        (l.totalExercises > 0 && l.completedExercises >= l.totalExercises),
    )
  );
};

export const lessonDone = (l: Level["lessons"][number]): boolean =>
  (l.progressPercent || 0) >= 100 ||
  (l.totalExercises > 0 && l.completedExercises >= l.totalExercises);

/**
 * Mendapatkan backend base URL dari environment variable atau fallback ke http://localhost:4000
 */
export const getBackendBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
};

/**
 * Memeriksa apakah path merupakan file aset lokal statis frontend di folder public/
 */
export const isLocalFrontendAsset = (url: string): boolean => {
  const clean = url.trim().replace(/^\/+/, "").toLowerCase();
  return (
    clean.startsWith("bannervidio") ||
    clean.startsWith("bannerflash") ||
    clean.startsWith("cepat") ||
    clean.startsWith("asetabjad") ||
    clean.startsWith("asetangka") ||
    clean.startsWith("vidiomaaf") ||
    clean.startsWith("vidioterimakasih") ||
    clean.startsWith("avatar") ||
    clean.startsWith("icon") ||
    clean.startsWith("karaktersapaan") ||
    clean.startsWith("piala") ||
    clean.startsWith("streak") ||
    clean.startsWith("bisara") ||
    clean.startsWith("aksesibelitas") ||
    clean.startsWith("wasm/") ||
    clean.startsWith("next.svg") ||
    clean.startsWith("vercel.svg") ||
    clean.startsWith("globe.svg") ||
    clean.startsWith("file.svg") ||
    clean.startsWith("window.svg") ||
    clean.startsWith("logo.svg")
  );
};

/**
 * Mengubah URL media (foto/video) dari backend menjadi URL absolut yang siap dimuat:
 * - Jika sudah URL absolut (http://, https://, blob:, data:), gunakan langsung.
 * - Jika path relatif dari backend (/assets/image/..., /assets/..., /uploads/..., dll.), gabungkan dengan API URL backend.
 * - Jika aset statis lokal frontend (/bannervidio.png, dll.), gunakan path lokal.
 * - Jika kosong/null, gunakan fallback lokal.
 */
export const resolveMediaUrl = (
  rawUrl?: string | null,
  fallback: string = "",
): string => {
  if (!rawUrl || typeof rawUrl !== "string") {
    return fallback;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return fallback;
  }

  // Jika URL absolut
  if (/^(https?:|blob:|data:|\/\/)/i.test(trimmed)) {
    return trimmed;
  }

  // Jika merupakan file aset lokal bawaan frontend di folder /public
  if (isLocalFrontendAsset(trimmed)) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  // Semua path relatif lainnya (seperti /assets/image/..., /uploads/..., dll.)
  // berasal dari backend, sehingga otomatis digabungkan dengan backend base URL
  const base = getBackendBaseUrl().replace(/\/+$/, "");
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
};

/**
 * Memeriksa apakah URL atau tipe media merupakan Video
 */
export const isVideoMedia = (
  type?: string | null,
  url?: string | null,
): boolean => {
  if (type && type.toUpperCase() === "VIDEO") return true;
  if (type && type.toUpperCase() === "IMAGE") return false;
  if (!url) return false;

  // Format atau path video
  if (
    /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(url) ||
    url.includes("/video/upload/") ||
    url.includes("/videos/") ||
    url.includes("/assets/video")
  ) {
    return true;
  }

  // Format atau path gambar
  if (
    /\.(png|jpe?g|gif|webp|svg|bmp|avif)($|\?)/i.test(url) ||
    url.includes("/assets/image") ||
    url.includes("/images/")
  ) {
    return false;
  }

  return false;
};

export interface ResolvedMedia {
  url: string;
  thumbnail: string | null;
  isVideo: boolean;
  type: "VIDEO" | "IMAGE";
  hasMedia: boolean;
}

/**
 * Ekstraksi & normalisasi media (foto/video) untuk LessonMaterial
 */
export const getMaterialMedia = (material: LessonMaterial): ResolvedMedia => {
  const signMediaList = material.sign?.media || [];
  const isExplicitVideo = material.type?.toUpperCase() === "VIDEO";

  let candidateUrl = material.mediaUrl;
  let candidateThumb: string | null = null;
  let isVideo = isExplicitVideo || isVideoMedia(material.type, candidateUrl);

  if (isExplicitVideo) {
    const videoObj = signMediaList.find(
      (m) => m.type?.toUpperCase() === "VIDEO",
    );
    if (videoObj?.url) {
      candidateUrl = candidateUrl || videoObj.url;
      candidateThumb = videoObj.thumbnail || null;
    }
  } else {
    const imgObj = signMediaList.find((m) => m.type?.toUpperCase() === "IMAGE");
    if (imgObj?.url) {
      candidateUrl = candidateUrl || imgObj.url;
      candidateThumb = imgObj.thumbnail || null;
    }
  }

  // Fallback ke media pertama dari sign jika candidateUrl masih kosong
  if (!candidateUrl && signMediaList.length > 0) {
    candidateUrl = signMediaList[0].url;
    candidateThumb = signMediaList[0].thumbnail;
    if (signMediaList[0].type?.toUpperCase() === "VIDEO") {
      isVideo = true;
    }
  }

  const hasMedia = Boolean(candidateUrl || signMediaList.length > 0);

  if (candidateUrl && isVideoMedia(undefined, candidateUrl)) {
    isVideo = true;
  }

  const defaultFallback = isVideo ? "/bannervidio.png" : "/bannerflash.png";
  const finalUrl = resolveMediaUrl(candidateUrl, defaultFallback);
  const finalThumb = candidateThumb
    ? resolveMediaUrl(candidateThumb, "")
    : null;

  return {
    url: finalUrl,
    thumbnail: finalThumb,
    isVideo,
    type: isVideo ? "VIDEO" : "IMAGE",
    hasMedia,
  };
};

/**
 * Ekstraksi & normalisasi media (foto/video) untuk ExerciseItem
 */
export const getExerciseMedia = (exercise: ExerciseItem): ResolvedMedia => {
  const signMediaList =
    exercise.sign?.media || exercise.cvConfig?.targetSign?.media || [];

  let candidateUrl = exercise.mediaUrl;
  let candidateThumb: string | null = null;

  if (!candidateUrl && signMediaList.length > 0) {
    candidateUrl = signMediaList[0].url;
    candidateThumb = signMediaList[0].thumbnail;
  }

  const hasMedia = Boolean(candidateUrl || signMediaList.length > 0);
  const isVideo = isVideoMedia(exercise.type, candidateUrl);
  const defaultFallback = isVideo ? "/bannervidio.png" : "/Cepat1.png";
  const finalUrl = resolveMediaUrl(candidateUrl, defaultFallback);
  const finalThumb = candidateThumb
    ? resolveMediaUrl(candidateThumb, "")
    : null;

  return {
    url: finalUrl,
    thumbnail: finalThumb,
    isVideo,
    type: isVideo ? "VIDEO" : "IMAGE",
    hasMedia,
  };
};
