'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Lock, Play, RotateCcw } from "lucide-react";
import BarMenu from "@/components/BarMenu";
import Navbar from "@/components/Navbar";
import {
  apiService,
  FALLBACK_CATALOG,
  LearningCatalogData,
} from "@/lib/api-service";

// Satu warna brand: oranye #F97316 (Tailwind orange-500). Tidak ada gradient / hijau.
const ORANGE = "#F97316";
// v2: key baru agar data lama (dev/testing) tidak mengganggu
const STORAGE_KEY = "bisara_completed_levels_v2";

type Level = LearningCatalogData["levels"][number];

/* Level dianggap selesai jika:
   - tercatat selesai di localStorage, ATAU
   - progress level dari API sudah 100%, ATAU
   - semua lesson di dalamnya sudah 100% */
const isLevelDone = (level: Level, completedLevels: number[]) => {
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

const lessonDone = (l: Level["lessons"][number]) =>
  (l.progressPercent || 0) >= 100 ||
  (l.totalExercises > 0 && l.completedExercises >= l.totalExercises);

/* Lingkaran progres */
const CircularProgress = ({
  percent,
  state,
  size = 72,
  strokeWidth = 6,
}: {
  percent: number;
  state: "locked" | "active" | "done";
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = Math.min(100, Math.max(0, percent));
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className="relative flex shrink-0 select-none items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {state !== "locked" && value > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ORANGE}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {state === "locked" ? (
          <Lock size={18} className="text-slate-400" />
        ) : state === "done" ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F97316] text-white">
            <Check size={18} strokeWidth={3} />
          </span>
        ) : (
          <span className="text-sm font-extrabold text-slate-800">{value}%</span>
        )}
      </div>
    </div>
  );
};

/* Skeleton saat load awal */
const BelajarSkeleton = () => (
  <div className="flex w-full animate-pulse flex-col gap-6">
    <div className="h-36 w-full rounded-3xl bg-slate-200" />
    <div className="flex flex-col gap-3">
      <div className="h-4 w-44 rounded bg-slate-200" />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5"
        >
          <div className="flex flex-col gap-2.5">
            <div className="h-5 w-20 rounded-md bg-slate-200" />
            <div className="h-6 w-44 rounded bg-slate-200" />
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="mt-1 h-9 w-28 rounded-xl bg-slate-200" />
          </div>
          <div className="h-16 w-16 shrink-0 rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  </div>
);

const BelajarPage = () => {
  const router = useRouter();
  const [catalog, setCatalog] = useState<LearningCatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

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

  /* Ambil level selesai dari localStorage, validasi sequential */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) {
        // Pastikan sequential: level 1 harus ada sebelum 2, dst.
        // Sort numerik lalu ambil prefix yang valid (tidak ada gap).
        const sorted = (saved as number[]).filter((n) => typeof n === "number").sort((a, b) => a - b);
        const valid: number[] = [];
        for (let i = 0; i < sorted.length; i++) {
          const expected = i === 0 ? sorted[0] : valid[i - 1] + 1;
          if (sorted[i] === expected) valid.push(sorted[i]);
          else break; // gap — stop
        }
        setCompletedLevels(valid);
      }
    } catch {
      // abaikan error parse
    }
  }, []);

  /* Status tiap level: urut. Level N terbuka hanya jika SEMUA level sebelumnya selesai (100%). */
  const levelStates = useMemo(() => {
    const levels = catalog?.levels || [];
    return levels.map((level, idx) => {
      const done = isLevelDone(level, completedLevels);
      const unlocked =
        idx === 0 ||
        levels.slice(0, idx).every((prev) => isLevelDone(prev, completedLevels));
      const state: "locked" | "active" | "done" = !unlocked
        ? "locked"
        : done
        ? "done"
        : "active";

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
  }, [catalog, completedLevels]);

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
              {/* Hero */}
              <section className="rounded-3xl bg-[#F97316] p-5 text-white md:p-8">
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider md:text-xs">
                  Modul Praktik BISINDO
                </span>
                <h1 className="mt-3 text-xl font-bold leading-tight md:text-3xl">
                  Pusat Belajar Bahasa Isyarat
                </h1>
                <p className="mt-2 text-xs leading-relaxed text-white/90 md:text-base">
                  Selesaikan setiap level sampai 100% untuk membuka level berikutnya.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/25">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-700"
                      style={{
                        width: `${
                          levelStates.length
                            ? (doneCount / levelStates.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold md:text-sm">
                    {doneCount}/{levelStates.length} level
                  </span>
                </div>
              </section>

              {/* Peta level */}
              <section className="flex flex-col gap-3">
                <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400 md:text-sm">
                  Peta Level Pembelajaran
                </h2>

                <div className="flex flex-col">
                  {levelStates.map(
                    ({ level, state, totalChapters, completedChapters, percent }, idx) => {
                      const isLast = idx === levelStates.length - 1;
                      const lessonSlug = level.lessons?.[0]?.slug;
                      const nextUnlocked =
                        !isLast && levelStates[idx + 1].state !== "locked";

                      return (
                        <div key={`${level.code}-${level.title}`} className="flex flex-col items-center">
                          <div
                            className={`flex w-full items-center justify-between gap-4 rounded-3xl border-2 bg-white p-5 transition md:p-6 ${
                              state === "active"
                                ? "border-[#F97316] shadow-sm"
                                : state === "done"
                                ? "border-slate-200 hover:border-[#F97316]/50"
                                : "border-slate-200 opacity-70"
                            }`}
                          >
                            <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                  state === "locked"
                                    ? "bg-slate-100 text-slate-400"
                                    : "bg-[#F97316] text-white"
                                }`}
                              >
                                Level {level.code}
                              </span>

                              <h3 className="text-base font-extrabold text-slate-900 md:text-lg">
                                {level.title.replace(/^Level\s*\d+:\s*/i, "")}
                              </h3>

                              <p className="text-xs font-medium text-slate-500">
                                {state === "locked"
                                  ? "Selesaikan level sebelumnya untuk membuka"
                                  : `${completedChapters} dari ${totalChapters} chapter selesai`}
                              </p>

                              {state === "locked" ? (
                                <button
                                  type="button"
                                  disabled
                                  className="mt-2.5 inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-400"
                                >
                                  <Lock size={14} />
                                  Terkunci
                                </button>
                              ) : state === "done" ? (
                                <button
                                  type="button"
                                  onClick={() => handleStartWorkout(lessonSlug)}
                                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl border-2 border-[#F97316] bg-white px-4 py-2 text-xs font-bold text-[#F97316] transition hover:bg-[#F97316]/10 active:scale-95"
                                >
                                  <RotateCcw size={14} />
                                  Ulangi Level
                                  <ChevronRight size={14} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleStartWorkout(lessonSlug)}
                                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-[#F97316] px-4 py-2 text-xs font-bold text-white transition hover:brightness-95 active:scale-95"
                                >
                                  <Play size={14} fill="currentColor" />
                                  {percent > 0 ? "Lanjut Kerjakan" : "Mulai Kerjakan"}
                                  <ChevronRight size={14} />
                                </button>
                              )}
                            </div>

                            <CircularProgress percent={percent} state={state} />
                          </div>

                          {/* Konektor antar level */}
                          {!isLast && (
                            <div
                              className={`h-8 w-0.5 rounded-full ${
                                nextUnlocked ? "bg-[#F97316]" : "bg-slate-200"
                              }`}
                            />
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <BarMenu />
    </>
  );
};

export default BelajarPage;