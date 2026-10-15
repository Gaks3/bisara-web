import { Sparkles, X } from "lucide-react";
import { GRADIENT_BRAND, WorkoutStage } from "./types";

interface LatihanHeaderProps {
  stage: WorkoutStage;
  materialIndex: number;
  totalMaterials: number;
  exerciseIndex: number;
  totalExercises: number;
  progressPercent: number;
  totalXpEarned: number;
  onExit: () => void;
}

export const LatihanHeader = ({
  stage,
  materialIndex,
  totalMaterials,
  exerciseIndex,
  totalExercises,
  progressPercent,
  totalXpEarned,
  onExit,
}: LatihanHeaderProps) => {
  return (
    <header className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
      <button
        type="button"
        onClick={onExit}
        aria-label="Kembali ke Pusat Belajar"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <X size={20} />
      </button>

      {/* Progress Bar & Stage Indicator */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span className="truncate">
            {stage === "LEARNING_MATERIALS"
              ? `Materi ${materialIndex + 1} dari ${totalMaterials}`
              : `Latihan Soal ${exerciseIndex + 1} dari ${totalExercises}`}
          </span>
          <span className="text-[#F66750]">
            {stage === "LEARNING_MATERIALS" ? "Tahap 1: Belajar" : "Tahap 2: Soal"}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              background: GRADIENT_BRAND,
            }}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600 border border-amber-200">
        <Sparkles size={14} />
        <span>+{totalXpEarned} XP</span>
      </div>
    </header>
  );
};
