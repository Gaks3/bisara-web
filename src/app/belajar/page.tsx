'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BarMenu from "@/components/BarMenu";
import Navbar from "@/components/Navbar";
import {
  BelajarHero,
  BelajarSkeleton,
  isLevelDone,
  lessonDone,
  LevelMap,
  LevelStateItem,
} from "@/components/belajar";
import {
  apiService,
  FALLBACK_CATALOG,
  LearningCatalogData,
} from "@/lib/api-service";

const BelajarPage = () => {
  const router = useRouter();
  const [catalog, setCatalog] = useState<LearningCatalogData | null>(null);
  const [loading, setLoading] = useState(true);

  /* Load katalog */
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const cat = await apiService.getLearningCatalog();
        if (isMounted) setCatalog(cat || FALLBACK_CATALOG);
      } catch (err) {
        console.error("Failed to load catalog:", err);
        if (isMounted) setCatalog(FALLBACK_CATALOG);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  /* Status tiap level: urut berdasarkan API dan sekuensial.
     Level N terbuka hanya jika tidak dikunci API dan level sebelumnya sudah selesai. */
  const levelStates: LevelStateItem[] = useMemo(() => {
    const levels = catalog?.levels || [];
    return levels.map((level, idx) => {
      const done = isLevelDone(level);
      const isLockedByApi = level.isLocked === true || level.status === "LOCKED";
      const prevLevelsDone =
        idx === 0 || levels.slice(0, idx).every((prev) => isLevelDone(prev));
      const unlocked = prevLevelsDone && !isLockedByApi;
      const state: LevelStateItem["state"] = done ? "done" : unlocked ? "active" : "locked";

      const lessons = level.lessons || [];
      const totalChapters = lessons.length;
      const completedChapters = done
        ? totalChapters
        : unlocked
        ? lessons.filter(lessonDone).length
        : 0;
      const percent = done ? 100 : unlocked ? level.progressPercent || 0 : 0;

      return { level, state, totalChapters, completedChapters, percent };
    });
  }, [catalog]);

  const handleStartWorkout = (lessonSlug?: string) => {
    const slug = lessonSlug || "modul-abjad-a-z";
    router.push(`/belajar/latihan?lesson=${encodeURIComponent(slug)}`);
  };

  const doneCount = levelStates.filter((s) => s.state === "done").length;

  return (
    <>
      <Navbar />

      <main className="mb-20 flex flex-1 flex-col items-center bg-slate-50 px-4 py-5 md:py-8">
        <div className="flex w-full max-w-md flex-col gap-6 md:max-w-2xl">
          {loading || !catalog ? (
            <BelajarSkeleton />
          ) : (
            <>
              <BelajarHero doneCount={doneCount} totalLevels={levelStates.length} />
              <LevelMap levelStates={levelStates} onStartLevel={handleStartWorkout} />
            </>
          )}
        </div>
      </main>

      <BarMenu />
    </>
  );
};

export default BelajarPage;