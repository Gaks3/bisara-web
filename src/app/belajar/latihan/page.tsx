'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  apiService,
  ExerciseItem,
  FALLBACK_LESSON_DETAIL,
  LessonDetailData,
  LessonMaterial,
} from "@/lib/api-service";
import { saveCompletedLevel } from "@/components/belajar/utils";
import {
  CameraExercise,
  LatihanCompleted,
  LatihanHeader,
  MaterialView,
  McqExercise,
  WorkoutStage,
} from "@/components/belajar/latihan";

function LatihanExerciseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonSlug = searchParams.get("lesson") || "modul-abjad-a-z";

  const [lesson, setLesson] = useState<LessonDetailData>(FALLBACK_LESSON_DETAIL);
  const [materials, setMaterials] = useState<LessonMaterial[]>(FALLBACK_LESSON_DETAIL.materials);
  const [exercises, setExercises] = useState<ExerciseItem[]>(FALLBACK_LESSON_DETAIL.exercises);
  const [loading, setLoading] = useState(true);

  // Flow Stage: LEARNING_MATERIALS -> EXERCISES -> COMPLETED
  const [stage, setStage] = useState<WorkoutStage>("LEARNING_MATERIALS");
  const [materialIndex, setMaterialIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [totalXpEarned, setTotalXpEarned] = useState(0);

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

  // Navigation across Materials
  const currentMaterial = materials[materialIndex];
  const isLastMaterial = materialIndex === materials.length - 1;

  const handleNextMaterial = () => {
    if (!isLastMaterial) {
      setMaterialIndex((prev) => prev + 1);
    } else {
      // Finished all materials! Now start the exercises
      setStage("EXERCISES");
      setExerciseIndex(0);
    }
  };

  const handlePrevMaterial = () => {
    if (materialIndex > 0) {
      setMaterialIndex((prev) => prev - 1);
    }
  };

  // Exercise Navigation & Completion
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
      // Completed all exercises for this level!
      // Unlock next level in localStorage
      const levelCode = lesson.level?.code || 1;
      saveCompletedLevel(levelCode);
      setStage("COMPLETED");
    }
  };

  const handleExit = () => {
    if (
      confirm(
        "Ingin keluar dari sesi belajar ini? Selesaikan soal untuk membuka level berikutnya."
      )
    ) {
      router.push("/belajar");
    }
  };

  // Progress bar calculation
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

  // STAGE 3: COMPLETED SCREEN
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
            {/* TAHAP 1: BELAJAR DULU (FIELD MATERIALS DARI API RESPONSE) */}
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

            {/* TAHAP 2: PENGERJAAN SOAL (SETELAH BELAJAR MATERI SELESAI) */}
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
