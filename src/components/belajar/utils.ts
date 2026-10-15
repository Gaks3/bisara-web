import { Level } from "./types";

export const STORAGE_KEY = "bisara_completed_levels_v2";

/* Level dianggap selesai jika:
   - tercatat selesai di localStorage, ATAU
   - progress level dari API sudah 100%, ATAU
   - semua lesson di dalamnya sudah 100% */
export const isLevelDone = (level: Level, completedLevels: number[]): boolean => {
  if (completedLevels.includes(level.code)) return true;
  if ((level.progressPercent || 0) >= 100) return true;
  const lessons = level.lessons || [];
  return (
    lessons.length > 0 &&
    lessons.every(
      (l) =>
        (l.progressPercent || 0) >= 100 ||
        (l.totalExercises > 0 && l.completedExercises >= l.totalExercises)
    )
  );
};

export const lessonDone = (l: Level["lessons"][number]): boolean =>
  (l.progressPercent || 0) >= 100 ||
  (l.totalExercises > 0 && l.completedExercises >= l.totalExercises);

export const getCompletedLevelsFromStorage = (): number[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(saved)) {
      // Pastikan sequential: level 1 harus ada sebelum 2, dst.
      // Sort numerik lalu ambil prefix yang valid (tidak ada gap).
      const sorted = (saved as number[])
        .filter((n) => typeof n === "number")
        .sort((a, b) => a - b);
      const valid: number[] = [];
      for (let i = 0; i < sorted.length; i++) {
        const expected = i === 0 ? sorted[0] : valid[i - 1] + 1;
        if (sorted[i] === expected) valid.push(sorted[i]);
        else break; // gap — stop
      }
      return valid;
    }
  } catch {
    // abaikan error parse
  }
  return [];
};

export const saveCompletedLevel = (levelCode: number): void => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(saved) && !saved.includes(levelCode)) {
      saved.push(levelCode);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
  } catch (e) {
    console.warn("Error saving completed level:", e);
  }
};

