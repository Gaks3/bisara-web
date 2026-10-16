import { ChevronRight, Flame, Sparkles, Trophy } from "lucide-react";
import { LessonDetailData } from "@/lib/api-service";
import { GRADIENT_BRAND } from "./types";
import Image from "next/image";

interface LatihanCompletedProps {
  lesson: LessonDetailData;
  totalXpEarned: number;
  onContinueToMap: () => void;
  onGoHome: () => void;
}

export const LatihanCompleted = ({
  lesson,
  totalXpEarned,
  onContinueToMap,
  onGoHome,
}: LatihanCompletedProps) => {
  const nextLevelNum = (lesson.level?.code || 1) + 1;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-8">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-lg md:p-8">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-xl shadow-orange-500/30"
          style={{ background: GRADIENT_BRAND }}
        >
          <Trophy size={48} />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F66750]">
            Level {lesson.level?.code || 1} Selesai!
          </span>
          <h1 className="text-2xl font-black text-slate-900">
            Luar Biasa, Kamu Berhasil!
          </h1>
          <p className="text-xs leading-relaxed text-slate-500 md:text-sm">
            Kamu telah menyelesaikan seluruh materi belajar dan latihan soal untuk &quot;{lesson.title}&quot;.
            <br />
            <strong className="text-amber-600 font-bold">Level {nextLevelNum} sekarang sudah terbuka!</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 ">
            <Sparkles size={18} className="text-amber-500" />
            +{totalXpEarned || 75} XP
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-2.5 text-sm font-bold text-[#F66750] ">
              <Image
                src="/streak.svg"
                alt="Streak"
                width={16}
                height={16}
                className="object-contain"
              />
            Streak
          </div>
        </div>

        <div className="flex w-full flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={onContinueToMap}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105"
            style={{ background: GRADIENT_BRAND }}
          >
            Lanjut ke Peta Level
            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            Ke Beranda
          </button>
        </div>
      </div>
    </main>
  );
};
