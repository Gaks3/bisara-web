import { ChevronRight, Lock, Play, RotateCcw } from "lucide-react";
import { CircularProgress } from "./CircularProgress";
import { Level, LevelStatus } from "./types";

interface LevelCardProps {
  level: Level;
  state: LevelStatus;
  totalChapters: number;
  completedChapters: number;
  percent: number;
  onStart: (slug?: string) => void;
}

export const LevelCard = ({
  level,
  state,
  totalChapters,
  completedChapters,
  percent,
  onStart,
}: LevelCardProps) => {
  const lessonSlug = level.lessons?.[0]?.slug;

  return (
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
            onClick={() => onStart(lessonSlug)}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl border border-slate bg-white px-4 py-2 text-xs font-bold text-[#F97316] transition hover:bg-[#F97316]/10 active:scale-95"
          >
            <RotateCcw size={14} />
            Ulangi Level
            <ChevronRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onStart(lessonSlug)}
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
  );
};
