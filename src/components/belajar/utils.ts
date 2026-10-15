import { Level } from "./types";

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
        (l.totalExercises > 0 && l.completedExercises >= l.totalExercises)
    )
  );
};

export const lessonDone = (l: Level["lessons"][number]): boolean =>
  (l.progressPercent || 0) >= 100 ||
  (l.totalExercises > 0 && l.completedExercises >= l.totalExercises);

