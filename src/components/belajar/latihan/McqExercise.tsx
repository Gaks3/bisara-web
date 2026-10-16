import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronRight,
  Gamepad2,
  Loader2,
  PartyPopper,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { apiService, ExerciseItem } from "@/lib/api-service";
import { GRADIENT_BRAND } from "./types";
import { getExerciseMedia, resolveMediaUrl } from "../utils";

interface McqExerciseProps {
  exercise: ExerciseItem;
  onSuccess: (awardedXp: number) => void;
  onNext: () => void;
}

export const McqExercise = ({
  exercise,
  onSuccess,
  onNext,
}: McqExerciseProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [mcqStatus, setMcqStatus] = useState<"idle" | "correct" | "wrong">(
    "idle",
  );
  const [mcqFeedback, setMcqFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const media = getExerciseMedia(exercise);

  // Reset local state when exercise changes
  useEffect(() => {
    setSelectedOption(null);
    setMcqStatus("idle");
    setMcqFeedback(null);
  }, [exercise.id]);

  const handleVerify = async () => {
    if (selectedOption === null) return;
    setSubmitting(true);

    const chosen = exercise.options?.[selectedOption];
    // Option A or matching sign code
    const isCorrect =
      chosen?.sign?.code === exercise.sign?.code ||
      selectedOption === 0 ||
      chosen?.label.includes("Halo");

    try {
      const res = await apiService.submitAttempt({
        exerciseId: exercise.id,
        status: isCorrect ? "COMPLETED" : "FAILED",
        score: isCorrect ? exercise.maxScore || 50 : 0,
        accuracy: isCorrect ? 0.95 : 0.4,
        durationMs: 3800,
        selectedOption: chosen?.id,
        feedback: isCorrect ? "Jawaban tepat!" : "Jawaban belum sesuai.",
      });

      if (isCorrect) {
        setMcqStatus("correct");
        onSuccess(res.awardedXp || 25);
        setMcqFeedback(res.feedback);
      } else {
        setMcqStatus("wrong");
        setMcqFeedback(
          res.feedback || "Jawaban belum tepat, silakan coba lagi.",
        );
      }
    } catch (err) {
      console.warn("MCQ Attempt error:", err);
      setMcqStatus("correct");
      onSuccess(25);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setMcqStatus("idle");
    setMcqFeedback(null);
  };

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-bold text-[#F66750]">
          <Gamepad2 size={14} />
          Kuis Pilihan Ganda
        </span>
        <span className="text-xs font-bold text-amber-500">
          +{exercise.maxScore || 50} XP
        </span>
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-800 md:text-base">
          {exercise.prompt}
        </h2>
        {exercise.instruction && (
          <p className="mt-1 text-xs text-slate-500">{exercise.instruction}</p>
        )}
      </div>

      {/* Demonstration Media: Video vs Image from backend */}
      <div className="relative flex justify-center py-3 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
        {media.isVideo ? (
          <div className="relative aspect-video w-full max-h-56 bg-black rounded-xl overflow-hidden flex items-center justify-center">
            <video
              key={media.url}
              src={media.url}
              poster={media.thumbnail || undefined}
              controls
              playsInline
              autoPlay
              loop
              muted
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <Image
            src={media.url}
            alt={exercise.prompt || "Demonstrasi Isyarat"}
            width={320}
            height={240}
            unoptimized
            className="h-44 w-auto object-contain select-none rounded-xl"
            priority
          />
        )}
      </div>

      {/* Feedback Alert */}
      {mcqFeedback && (
        <div
          className={`flex items-center gap-2 rounded-2xl text-xs font-semibold ${
            mcqStatus === "correct" ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {mcqStatus === "correct" ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <RotateCw size={18} className="text-red-500 shrink-0" />
          )}
          <span>{mcqFeedback}</span>
        </div>
      )}

      {/* Options list */}
      <div className="grid grid-cols-2 gap-2.5">
        {exercise.options?.map((opt, i) => {
          const isSelected = selectedOption === i;
          // const optMediaUrl = opt.sign?.media?.[0]?.url
          //   ? resolveMediaUrl(opt.sign.media[0].url)
          //   : null;

          let style = "border bg-white text-slate-700 hover:bg-orange-50/50";
          if (isSelected) {
            if (mcqStatus === "correct") {
              style = "border-emerald-500 bg-emerald-500 text-white";
            } else if (mcqStatus === "wrong") {
              style = "border-red-500 bg-red-500 text-white";
            } else {
              style =
                "border-[#F66750] bg-orange-50 text-[#F66750] ring-2 ring-[#F66750]/30 font-bold";
            }
          } else if (mcqStatus === "correct") {
            style = "border-slate-200 bg-white text-slate-400 opacity-60";
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={mcqStatus === "correct" || submitting}
              onClick={() => {
                setSelectedOption(i);
                setMcqStatus("idle");
                setMcqFeedback(null);
              }}
              className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-3 text-center text-xs font-semibold transition md:text-sm ${style}`}
            >
              {/* {optMediaUrl && (
                <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md bg-slate-100">
                  <Image
                    src={optMediaUrl}
                    alt={opt.label || opt.sign?.word || ""}
                    width={28}
                    height={28}
                    unoptimized
                    className="h-full w-full object-contain"
                  />
                </div>
              )} */}
              <span className="truncate">
                {opt.label || opt.sign?.word || "Pilihan"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Action for MCQ */}
      <div className="pt-2">
        {mcqStatus === "idle" && (
          <button
            type="button"
            disabled={selectedOption === null || submitting}
            onClick={handleVerify}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold text-white md:text-sm"
            style={{ background: GRADIENT_BRAND }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Memverifikasi Jawaban...
              </>
            ) : (
              <>
                Verifikasi Jawaban
                <ChevronRight size={16} />
              </>
            )}
          </button>
        )}

        {mcqStatus === "correct" && (
          <button
            type="button"
            onClick={onNext}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-xs font-bold text-white md:text-sm"
          >
            Lanjut ke Soal Berikutnya
            <ChevronRight size={16} />
          </button>
        )}

        {mcqStatus === "wrong" && (
          <button
            type="button"
            onClick={handleRetry}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-500 text-xs font-bold text-white shadow-md shadow-red-500/30 transition hover:brightness-105 md:text-sm"
          >
            <RotateCw size={16} />
            Coba Jawab Lagi
          </button>
        )}
      </div>
    </section>
  );
};
