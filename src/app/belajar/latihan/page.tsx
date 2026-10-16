'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import {
  apiService,
  ExerciseItem,
  FALLBACK_LESSON_DETAIL,
  LessonDetailData,
  LessonMaterial,
} from "@/lib/api-service";
import {
  CameraExercise,
  LatihanCompleted,
  LatihanHeader,
  MaterialView,
  McqExercise,
  WorkoutStage,
} from "@/components/belajar/latihan";


function ExitConfirmModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F66750]/10">
          <LogOut className="h-6 w-6 text-[#F66750]" />
        </div>

        <h2
          id="exit-modal-title"
          className="text-center text-lg font-bold text-slate-800"
        >
          Keluar dari sesi belajar?
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Selesaikan soal untuk membuka level berikutnya.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            onClick={onCancel}
            className="w-full rounded-xl bg-[#F66750] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Lanjut Belajar
          </button>
          <button
            onClick={onConfirm}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  );
}

function LatihanExerciseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonSlug = searchParams.get("lesson") || "modul-abjad-a-z";

  const [lesson, setLesson] = useState<LessonDetailData>(FALLBACK_LESSON_DETAIL);
  const [materials, setMaterials] = useState<LessonMaterial[]>(FALLBACK_LESSON_DETAIL.materials);
  const [exercises, setExercises] = useState<ExerciseItem[]>(FALLBACK_LESSON_DETAIL.exercises);
  const [loading, setLoading] = useState(true);

  const [stage, setStage] = useState<WorkoutStage>("LEARNING_MATERIALS");
  const [materialIndex, setMaterialIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [totalXpEarned, setTotalXpEarned] = useState(0);

  // State modal keluar
  const [showExitModal, setShowExitModal] = useState(false);

  // Load lesson detail
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        let lessonData: LessonDetailData | null = null;
        if (lessonSlug) {
          lessonData = await apiService.getLessonDetail(lessonSlug);
        }
        if (isMounted) {
          const finalData = lessonData || FALLBACK_LESSON_DETAIL;
          setLesson(finalData);
          if (finalData.materials && finalData.materials.length > 0) {
            setMaterials(finalData.materials);
          }
          if (finalData.exercises && finalData.exercises.length > 0) {
            setExercises(finalData.exercises);
          }
        }
      } catch (err) {
        console.error("Failed to load lesson:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [lessonSlug]);

  const currentMaterial = materials[materialIndex];
  const isLastMaterial = materialIndex === materials.length - 1;

  const handleNextMaterial = () => {
    if (!isLastMaterial) {
      setMaterialIndex((prev) => prev + 1);
    } else {
      setStage("EXERCISES");
      setExerciseIndex(0);
    }
  };

  const handlePrevMaterial = () => {
    if (materialIndex > 0) {
      setMaterialIndex((prev) => prev - 1);
    }
  };

  const currentExercise: ExerciseItem | undefined = exercises[exerciseIndex];
  const isCameraExercise =
    currentExercise?.type === "AI_PRACTICE" ||
    currentExercise?.type === "GESTURE_PRACTICE" ||
    !!currentExercise?.cvConfig ||
    !currentExercise?.options ||
    currentExercise.options.length === 0;

  const handleAwardXp = (awardedXp: number) => {
    setTotalXpEarned((prev) => prev + awardedXp);
  };

  const handleNextExercise = () => {
    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex((prev) => prev + 1);
    } else {
      setStage("COMPLETED");
    }
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    router.push("/belajar");
  };

  let progressPercent = 0;
  if (stage === "LEARNING_MATERIALS") {
    progressPercent = Math.round(
      ((materialIndex + 1) / (materials.length + exercises.length)) * 100
    );
  } else if (stage === "EXERCISES") {
    progressPercent = Math.round(
      ((materials.length + exerciseIndex + 1) /
        (materials.length + exercises.length)) *
        100
    );
  } else {
    progressPercent = 100;
  }

  if (stage === "COMPLETED") {
    return (
      <LatihanCompleted
        lesson={lesson}
        totalXpEarned={totalXpEarned}
        onContinueToMap={() => router.push("/belajar")}
        onGoHome={() => router.push("/home")}
      />
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F8FAFC] px-4 py-4 md:py-6">
      <div className="flex w-full max-w-md flex-col gap-4 md:max-w-2xl">
        <LatihanHeader
          stage={stage}
          materialIndex={materialIndex}
          totalMaterials={materials.length}
          exerciseIndex={exerciseIndex}
          totalExercises={exercises.length}
          progressPercent={progressPercent}
          totalXpEarned={totalXpEarned}
          onExit={handleExit}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#F66750]" />
            <p className="text-xs font-semibold text-slate-500">
              Menyiapkan materi belajar...
            </p>
          </div>
        ) : (
          <>
            {stage === "LEARNING_MATERIALS" && currentMaterial && (
              <MaterialView
                material={currentMaterial}
                materialIndex={materialIndex}
                totalMaterials={materials.length}
                isLastMaterial={isLastMaterial}
                onNext={handleNextMaterial}
                onPrev={handlePrevMaterial}
              />
            )}

            {stage === "EXERCISES" && currentExercise && (
              <>
                {!isCameraExercise ? (
                  <McqExercise
                    key={currentExercise.id}
                    exercise={currentExercise}
                    onSuccess={handleAwardXp}
                    onNext={handleNextExercise}
                  />
                ) : (
                  <CameraExercise
                    key={currentExercise.id}
                    exercise={currentExercise}
                    onSuccess={handleAwardXp}
                    onNext={handleNextExercise}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      <ExitConfirmModal
        open={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
      />
    </main>
  );
}

export default function LatihanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#F66750]" />
            <p className="text-xs font-semibold text-slate-500">
              Menyiapkan ruang belajar...
            </p>
          </div>
        </div>
      }
    >
      <LatihanExerciseContent />
    </Suspense>
  );
}