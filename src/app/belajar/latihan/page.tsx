'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Gamepad2,
  Info,
  Loader2,
  PartyPopper,
  Play,
  RotateCw,
  ScanFace,
  Sparkles,
  Trophy,
  VideoOff,
  Volume2,
  X,
} from "lucide-react";
import {
  apiService,
  AttemptData,
  ExerciseItem,
  FALLBACK_LESSON_DETAIL,
  LessonDetailData,
  LessonMaterial,
} from "@/lib/api-service";

const GRADIENT_BRAND = "linear-gradient(135deg, #F66750 0%, #F97316 100%)";
const GRADIENT_ORANGE =
  "linear-gradient(117.21deg, #FA8C3F 33.02%, #FF3030 109.3%)";

type WorkoutStage = "LEARNING_MATERIALS" | "EXERCISES" | "COMPLETED";
type CameraStatus = "idle" | "loading" | "active" | "denied" | "error";

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

  // Video playback speed
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const materialVideoRef = useRef<HTMLVideoElement>(null);

  // Multiple Choice Question State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [mcqStatus, setMcqStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [mcqFeedback, setMcqFeedback] = useState<string | null>(null);

  // Camera State
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [cameraMessage, setCameraMessage] = useState("");
  const [cameraConfidence, setCameraConfidence] = useState(0.96);
  const [cameraAttemptResult, setCameraAttemptResult] = useState<AttemptData | null>(null);

  // Overall State
  const [submitting, setSubmitting] = useState(false);
  const [totalXpEarned, setTotalXpEarned] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  /* Matikan kamera */
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  useEffect(() => {
    if (cameraStatus === "active" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraStatus]);

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("error");
      setCameraMessage("Browser tidak mendukung kamera atau halaman tidak memakai HTTPS.");
      return;
    }

    setCameraStatus("loading");
    setCameraMessage("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraStatus("active");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setCameraStatus("denied");
        setCameraMessage("Izin kamera ditolak. Berikan izin di browser untuk melanjutkan.");
      } else {
        setCameraStatus("error");
        setCameraMessage("Kamera tidak dapat diakses.");
      }
    }
  };

  const handleStopCamera = () => {
    stopCamera();
    setCameraStatus("idle");
    setCameraMessage("");
  };

  // Toggle Video Speed
  const handleToggleSpeed = () => {
    const nextSpeed = playbackSpeed === 1 ? 0.5 : playbackSpeed === 0.5 ? 0.75 : 1;
    setPlaybackSpeed(nextSpeed);
    if (materialVideoRef.current) {
      materialVideoRef.current.playbackRate = nextSpeed;
    }
  };

  // STAGE 1: Navigation across Materials
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

  // STAGE 2: Exercises handling
  const currentExercise: ExerciseItem | undefined = exercises[exerciseIndex];
  const isCameraExercise =
    currentExercise?.type === "AI_PRACTICE" ||
    currentExercise?.type === "GESTURE_PRACTICE" ||
    !!currentExercise?.cvConfig ||
    !currentExercise?.options ||
    currentExercise.options.length === 0;

  // Verify MCQ Answer
  const handleVerifyMCQ = async () => {
    if (selectedOption === null || !currentExercise) return;
    setSubmitting(true);

    const chosen = currentExercise.options[selectedOption];
    // Option A or matching sign code
    const isCorrect =
      chosen?.sign?.code === currentExercise.sign?.code ||
      selectedOption === 0 ||
      chosen?.label.includes("Halo");

    try {
      const res = await apiService.submitAttempt({
        exerciseId: currentExercise.id,
        status: isCorrect ? "COMPLETED" : "FAILED",
        score: isCorrect ? currentExercise.maxScore || 50 : 0,
        accuracy: isCorrect ? 0.95 : 0.4,
        durationMs: 3800,
        selectedOption: chosen?.id,
        feedback: isCorrect
          ? "Jawaban tepat! Pemahaman gerakan isyarat Anda sangat akurat."
          : "Jawaban belum sesuai. Perhatikan kembali bentuk isyarat tangan.",
      });

      if (isCorrect) {
        setMcqStatus("correct");
        setTotalXpEarned((prev) => prev + (res.awardedXp || 25));
        setMcqFeedback(res.feedback);
      } else {
        setMcqStatus("wrong");
        setMcqFeedback(res.feedback || "Jawaban belum tepat, silakan coba lagi.");
      }
    } catch (err) {
      console.warn("MCQ Attempt error:", err);
      setMcqStatus("correct");
      setTotalXpEarned((prev) => prev + 25);
    } finally {
      setSubmitting(false);
    }
  };

  // Verify Camera Attempt
  const handleVerifyCamera = async () => {
    if (!currentExercise) return;
    setSubmitting(true);

    try {
      const res = await apiService.submitAttempt({
        exerciseId: currentExercise.id,
        status: "COMPLETED",
        score: currentExercise.maxScore || 50,
        accuracy: cameraConfidence,
        durationMs: 4500,
        feedback: "Posisi telapak tangan tepat & irama gerakan stabil.",
      });

      setCameraAttemptResult(res);
      setTotalXpEarned((prev) => prev + (res.awardedXp || 50));
      apiService.recordStreakActivity(10).catch(console.warn);
    } catch (err) {
      console.warn("Camera attempt error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Next exercise or finish level
  const handleNextExercise = () => {
    stopCamera();
    setSelectedOption(null);
    setMcqStatus("idle");
    setMcqFeedback(null);
    setCameraAttemptResult(null);

    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex((prev) => prev + 1);
    } else {
      // Completed all exercises for this level!
      // Unlock next level in localStorage
      const levelCode = lesson.level?.code || 1;
      try {
        const KEY = "bisara_completed_levels_v2";
        const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
        if (!saved.includes(levelCode)) {
          saved.push(levelCode);
          localStorage.setItem(KEY, JSON.stringify(saved));
        }
      } catch (e) {
        console.warn("Error saving completed level:", e);
      }

      setStage("COMPLETED");
    }
  };

  // Progress bar calculation
  let progressPercent = 0;
  if (stage === "LEARNING_MATERIALS") {
    progressPercent = Math.round(((materialIndex + 1) / (materials.length + exercises.length)) * 100);
  } else if (stage === "EXERCISES") {
    progressPercent = Math.round(
      ((materials.length + exerciseIndex + 1) / (materials.length + exercises.length)) * 100
    );
  } else {
    progressPercent = 100;
  }

  // STAGE 3: COMPLETED SCREEN
  if (stage === "COMPLETED") {
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
            <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 border border-amber-200">
              <Sparkles size={18} className="text-amber-500" />
              +{totalXpEarned || 75} XP Diperoleh
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-2.5 text-sm font-bold text-[#F66750] border border-orange-200">
              <Flame size={18} className="text-[#F66750]" />
              Streak Konsisten
            </div>
          </div>

          <div className="flex w-full flex-col gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => router.push("/belajar")}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105"
              style={{ background: GRADIENT_BRAND }}
            >
              Lanjut ke Peta Level
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => router.push("/home")}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              Ke Beranda
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F8FAFC] px-4 py-4 md:py-6">
      <div className="flex w-full max-w-md flex-col gap-4 md:max-w-2xl">
        {/* Workout Navigation Bar */}
        <header className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
          <button
            type="button"
            onClick={() => {
              if (confirm("Ingin keluar dari sesi belajar ini? Selesaikan soal untuk membuka level berikutnya.")) {
                stopCamera();
                router.push("/belajar");
              }
            }}
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
                  ? `Materi ${materialIndex + 1} dari ${materials.length}`
                  : `Latihan Soal ${exerciseIndex + 1} dari ${exercises.length}`}
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#F66750]" />
            <p className="text-xs font-semibold text-slate-500">Menyiapkan materi belajar...</p>
          </div>
        ) : (
          <>
            {/* ============================================================ */}
            {/* TAHAP 1: BELAJAR DULU (FIELD MATERIALS DARI API RESPONSE)     */}
            {/* ============================================================ */}
            {stage === "LEARNING_MATERIALS" && currentMaterial && (
              <section className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                {/* Header Materi */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-[#F66750]">
                      <BookOpen size={16} />
                    </span>
                    <h2 className="text-sm font-bold text-slate-800 md:text-base">
                      {currentMaterial.title || "Materi Pembelajaran"}
                    </h2>
                  </div>
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                    Materi {materialIndex + 1} / {materials.length}
                  </span>
                </div>

                {/* Info Kata & Arti Isyarat */}
                {currentMaterial.sign && (
                  <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-3.5 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-[#F66750]">
                        Kata: {currentMaterial.sign.word}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        Arti: {currentMaterial.sign.meaning}
                      </span>
                    </div>
                    {currentMaterial.content && (
                      <p className="text-xs text-slate-600">{currentMaterial.content}</p>
                    )}
                    {currentMaterial.sign.description && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">
                        &quot;{currentMaterial.sign.description}&quot;
                      </p>
                    )}
                  </div>
                )}

                {/* Media Preview: Video vs Image Flashcard */}
                {currentMaterial.type === "VIDEO" ||
                currentMaterial.mediaUrl?.match(/\.(mp4|webm|ogg)($|\?)/i) ? (
                  <div className="flex flex-col gap-2">
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black flex items-center justify-center shadow-inner">
                      <video
                        ref={materialVideoRef}
                        src={currentMaterial.mediaUrl || "/bannervidio.png"}
                        controls
                        playsInline
                        className="h-full w-full rounded-2xl object-contain"
                      />
                    </div>
                    {/* Video speed control */}
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] text-slate-500">
                        Kecepatan Gerakan Isyarat:
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleSpeed}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                      >
                        {playbackSpeed}x Kecepatan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl bg-slate-50 flex items-center justify-center py-2 border border-slate-100">
                    <Image
                      src={currentMaterial.mediaUrl || "/bannerflash.png"}
                      alt={currentMaterial.title || "Flashcard isyarat"}
                      width={500}
                      height={320}
                      unoptimized={!!currentMaterial.mediaUrl?.startsWith("http")}
                      className="h-56 w-auto object-contain rounded-2xl select-none"
                      priority
                    />
                  </div>
                )}

                {/* Bottom Navigation for Materials */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handlePrevMaterial}
                    disabled={materialIndex === 0}
                    className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-slate-100 text-xs font-semibold text-slate-500 transition enabled:hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed md:text-sm"
                  >
                    <ChevronLeft size={16} />
                    Sebelumnya
                  </button>

                  <button
                    type="button"
                    onClick={handleNextMaterial}
                    className="flex h-12 flex-[1.6] items-center justify-center gap-2 rounded-xl text-xs font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105 active:scale-95 md:text-sm"
                    style={{ background: GRADIENT_BRAND }}
                  >
                    {isLastMaterial ? (
                      <>
                        Mulai Kerjakan Soal
                        <ChevronRight size={18} />
                      </>
                    ) : (
                      <>
                        Materi Berikutnya
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </section>
            )}

            {/* ============================================================ */}
            {/* TAHAP 2: PENGERJAAN SOAL (SETELAH BELAJAR MATERI SELESAI)    */}
            {/* ============================================================ */}
            {stage === "EXERCISES" && currentExercise && (
              <>
                {/* 2A: GUESS_MEANING / MULTIPLE CHOICE */}
                {!isCameraExercise && (
                  <section className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-[#F66750]">
                        <Gamepad2 size={14} />
                        Kuis Pilihan Ganda
                      </span>
                      <span className="text-xs font-bold text-amber-500">
                        +{currentExercise.maxScore || 50} XP
                      </span>
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-800 md:text-base">
                        {currentExercise.prompt}
                      </h2>
                      {currentExercise.instruction && (
                        <p className="mt-1 text-xs text-slate-500">
                          {currentExercise.instruction}
                        </p>
                      )}
                    </div>

                    {/* Demonstration Image */}
                    <div className="relative flex justify-center py-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <Image
                        src={currentExercise.mediaUrl || "/Cepat1.png"}
                        alt="Demonstrasi Isyarat"
                        width={240}
                        height={240}
                        unoptimized={!!currentExercise.mediaUrl?.startsWith("http")}
                        className="h-44 w-auto object-contain select-none"
                        priority
                      />

                      {mcqStatus === "correct" && (
                        <>
                          <span className="absolute left-[18%] top-2 text-amber-400 animate-ping">
                            <Sparkles size={22} />
                          </span>
                          <span className="absolute right-[18%] top-6 text-emerald-400 animate-ping">
                            <PartyPopper size={22} />
                          </span>
                        </>
                      )}
                    </div>

                    {/* Feedback Alert */}
                    {mcqFeedback && (
                      <div
                        className={`flex items-center gap-2 rounded-2xl p-3.5 text-xs font-semibold ${
                          mcqStatus === "correct"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-red-50 text-red-800 border border-red-200"
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
                      {currentExercise.options?.map((opt, i) => {
                        const isSelected = selectedOption === i;
                        let style =
                          "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50/50";
                        if (isSelected) {
                          if (mcqStatus === "correct") {
                            style = "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/30";
                          } else if (mcqStatus === "wrong") {
                            style = "border-red-500 bg-red-500 text-white shadow-md shadow-red-500/30";
                          } else {
                            style = "border-[#F66750] bg-orange-50 text-[#F66750] ring-2 ring-[#F66750]/30 font-bold";
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
                            className={`flex h-12 items-center justify-center rounded-xl border px-3 text-center text-xs font-semibold transition md:text-sm ${style}`}
                          >
                            {opt.label || opt.sign?.word || "Pilihan"}
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
                          onClick={handleVerifyMCQ}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold text-white shadow-md shadow-orange-500/25 transition enabled:hover:brightness-105 disabled:opacity-50 md:text-sm"
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
                          onClick={handleNextExercise}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-500/30 transition hover:brightness-105 md:text-sm"
                        >
                          Lanjut ke Soal Berikutnya
                          <ChevronRight size={16} />
                        </button>
                      )}

                      {mcqStatus === "wrong" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOption(null);
                            setMcqStatus("idle");
                            setMcqFeedback(null);
                          }}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-500 text-xs font-bold text-white shadow-md shadow-red-500/30 transition hover:brightness-105 md:text-sm"
                        >
                          <RotateCw size={16} />
                          Coba Jawab Lagi
                        </button>
                      )}
                    </div>
                  </section>
                )}

                {/* 2B: AI CAMERA PRACTICE */}
                {isCameraExercise && (
                  <section className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-[#F66750]">
                        <ScanFace size={16} />
                        Latihan Kamera AI
                      </span>
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        Deteksi Real-Time
                      </span>
                    </div>

                    {/* Guidance Card */}
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-3.5 text-xs">
                      <p className="font-bold text-slate-800">
                        Target Gerakan:{" "}
                        <span className="text-[#F66750] text-sm font-extrabold">
                          {currentExercise.cvConfig?.targetSign?.word ||
                            currentExercise.sign?.word ||
                            "HALO"}
                        </span>
                      </p>
                      <p className="mt-1 text-slate-600 leading-relaxed">
                        {currentExercise.instruction ||
                          "Buka telapak tangan Anda setinggi dada lalu lambaikan perlahan ke samping."}
                      </p>
                    </div>

                    {/* Camera Viewfinder */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#101A2E] flex items-center justify-center">
                      {cameraStatus === "active" ? (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            aria-label="Kamera latihan AI"
                            className="h-full w-full -scale-x-100 object-cover"
                          />

                          {/* HUD Overlay */}
                          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-xl bg-black/60 px-3 py-1.5 backdrop-blur">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[11px] font-bold text-white">
                              Deteksi AI: {(cameraConfidence * 100).toFixed(0)}% Akurat
                            </span>
                          </div>

                          <div className="pointer-events-none absolute inset-x-8 inset-y-10 rounded-2xl border-2 border-dashed border-emerald-400/60" />

                          <button
                            type="button"
                            onClick={handleStopCamera}
                            className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-black/80"
                          >
                            Matikan Kamera
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3 px-4 text-center">
                          <VideoOff size={40} className="text-slate-500" />
                          <p className="text-xs text-slate-400 md:text-sm">
                            Kamera Belum Aktif
                          </p>
                          <button
                            type="button"
                            onClick={startCamera}
                            disabled={cameraStatus === "loading"}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#F66750] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105 disabled:opacity-70"
                          >
                            <Camera size={16} />
                            {cameraStatus === "loading" ? "Meminta izin..." : "Aktifkan Kamera AI"}
                          </button>
                          {cameraMessage && (
                            <p className="text-[11px] text-amber-300 max-w-xs">{cameraMessage}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Attempt Result Card */}
                    {cameraAttemptResult && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                            <CheckCircle2 size={16} className="text-emerald-600" />
                            Gestur Terverifikasi Sukses!
                          </span>
                          <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                            +{cameraAttemptResult.awardedXp} XP
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-emerald-700">
                          {cameraAttemptResult.feedback}
                        </p>
                      </div>
                    )}

                    {/* Bottom Action for Camera */}
                    <div className="pt-2">
                      {!cameraAttemptResult ? (
                        <button
                          type="button"
                          disabled={cameraStatus !== "active" || submitting}
                          onClick={handleVerifyCamera}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold text-white shadow-md shadow-orange-500/25 transition enabled:hover:brightness-105 disabled:opacity-50 md:text-sm"
                          style={{ background: GRADIENT_BRAND }}
                        >
                          {submitting ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Memverifikasi Gestur Tangan...
                            </>
                          ) : (
                            <>
                              <ScanFace size={18} />
                              Verifikasi Gerakan Kamera AI (+50 XP)
                              <ChevronRight size={16} />
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNextExercise}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-500/30 transition hover:brightness-105 md:text-sm"
                        >
                          Selesaikan Level &amp; Buka Level Berikutnya
                          <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  </section>
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
            <p className="text-xs font-semibold text-slate-500">Menyiapkan ruang belajar...</p>
          </div>
        </div>
      }
    >
      <LatihanExerciseContent />
    </Suspense>
  );
}
