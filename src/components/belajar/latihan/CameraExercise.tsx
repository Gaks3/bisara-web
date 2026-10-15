// src/components/belajar/latihan/CameraExercise.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Lock,
  Play,
  RotateCcw,
  ScanFace,
  VideoOff,
} from "lucide-react";
import { apiService, AttemptData, ExerciseItem } from "@/lib/api-service";
import { useBisindoDetector } from "@/hooks/useBisindoDetector";
import { CameraStatus, GRADIENT_BRAND } from "./types";

const COUNTDOWN_SECONDS = 3;

interface CameraExerciseProps {
  exercise: ExerciseItem;
  onSuccess: (awardedXp: number) => void;
  onNext: () => void;
}

export const CameraExercise = ({
  exercise,
  onSuccess,
  onNext,
}: CameraExerciseProps) => {
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [cameraMessage, setCameraMessage] = useState("");
  const [cameraAttemptResult, setCameraAttemptResult] =
    useState<AttemptData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // State baru: deteksi belum dimulai sampai user menekan "Mulai Deteksi"
  const [detectionStarted, setDetectionStarted] = useState(false);
  // State countdown sebelum deteksi dimulai
  const [countdown, setCountdown] = useState<number | null>(null);
  // State untuk mengunci hasil deteksi setelah selesai
  const [detectionLocked, setDetectionLocked] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Jalankan hook deteksi ONNX LSTM — model dimuat saat kamera aktif, frame diproses setelah deteksi dimulai
  const {
    isModelLoading,
    isModelReady,
    modelError,
    detection,
    resetDetection,
    loadModels,
  } = useBisindoDetector(
    videoRef,
    detectionStarted && !detectionLocked && !cameraAttemptResult,
  );

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  useEffect(() => {
    stopCamera();
    clearCountdown();
    setCameraStatus("idle");
    setCameraMessage("");
    setCameraAttemptResult(null);
    setDetectionStarted(false);
    setCountdown(null);
    setDetectionLocked(false);
    resetDetection();
  }, [exercise.id, stopCamera, clearCountdown, resetDetection]);

  useEffect(() => {
    if (cameraStatus === "active" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraStatus]);

  // Muat model segera setelah kamera aktif (agar siap sebelum user menekan "Mulai Deteksi")
  useEffect(() => {
    if (cameraStatus === "active" && !isModelReady && !isModelLoading) {
      loadModels();
    }
  }, [cameraStatus, isModelReady, isModelLoading, loadModels]);

  // Kunci hasil deteksi setelah buffer terisi penuh (30 frame)
  useEffect(() => {
    if (
      detectionStarted &&
      !detectionLocked &&
      detection.bufferProgress >= 30
    ) {
      setDetectionLocked(true);
    }
  }, [detectionStarted, detectionLocked, detection.bufferProgress]);

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("error");
      setCameraMessage(
        "Browser tidak mendukung kamera atau halaman tidak memakai HTTPS.",
      );
      return;
    }

    setCameraStatus("loading");
    setCameraMessage("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      setCameraStatus("active");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setCameraStatus("denied");
        setCameraMessage(
          "Izin kamera ditolak. Berikan izin di browser untuk melanjutkan.",
        );
      } else {
        setCameraStatus("error");
        setCameraMessage("Kamera tidak dapat diakses.");
      }
    }
  };

  const handleStartDetection = () => {
    // Mulai countdown sebelum deteksi
    setCountdown(COUNTDOWN_SECONDS);
    setDetectionLocked(false);
    setDetectionStarted(false);

    clearCountdown();

    let remaining = COUNTDOWN_SECONDS;
    countdownTimerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearCountdown();
        setCountdown(null);
        setDetectionStarted(true);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  };

  const handleStopCamera = () => {
    stopCamera();
    clearCountdown();
    setCameraStatus("idle");
    setCameraMessage("");
    setDetectionStarted(false);
    setCountdown(null);
    setDetectionLocked(false);
    resetDetection();
  };

  const targetWord =
    exercise.cvConfig?.targetSign?.code || exercise.sign?.code || "A";
  const threshold = exercise.cvConfig?.confidenceThreshold || 0.5;

  // Cek apakah deteksi sudah benar (terverifikasi sukses dan bukan idle)
  const isCorrect =
    (!!cameraAttemptResult && cameraAttemptResult.status !== "FAILED") ||
    (detectionLocked &&
      detection.label.toLowerCase() !== "idle" &&
      detection.label.toLowerCase() === targetWord.toLowerCase() &&
      detection.confidence >= threshold);

  // Cek apakah deteksi salah (kondisi idle = belum sesuai, label tidak cocok, atau submit FAILED)
  const isWrong =
    (!isCorrect &&
      detectionLocked &&
      (detection.label.toLowerCase() === "idle" ||
        detection.label.toLowerCase() !== targetWord.toLowerCase() ||
        detection.confidence < threshold)) ||
    cameraAttemptResult?.status === "FAILED";

  const handleRetry = useCallback(() => {
    resetDetection();
    setDetectionLocked(false);
    setDetectionStarted(false);
    setCameraAttemptResult(null);

    // Mulai countdown baru secara otomatis agar langsung bersiap
    setCountdown(COUNTDOWN_SECONDS);
    clearCountdown();

    let remaining = COUNTDOWN_SECONDS;
    countdownTimerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearCountdown();
        setCountdown(null);
        setDetectionStarted(true);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }, [resetDetection, clearCountdown]);

  const handleVerify = useCallback(async () => {
    if (submitting || cameraAttemptResult) return;
    setSubmitting(true);

    try {
      const res = await apiService.submitAttempt({
        exerciseId: exercise.id,
        status: "COMPLETED",
        score: exercise.maxScore || 50,
        accuracy: Number(detection.confidence.toFixed(2)) || 0.9,
        durationMs: 4500,
        feedback: `Isyarat "${detection.label}" terdeteksi dengan akurasi ${(
          detection.confidence * 100
        ).toFixed(0)}%.`,
        detectionData: {
          detectedClass: detection.label,
          probabilities: detection.probabilities,
        },
      });

      setCameraAttemptResult(res);
      onSuccess(res.awardedXp || 50);
      apiService.recordStreakActivity(10).catch(console.warn);
    } catch (err) {
      console.warn("Camera attempt error:", err);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, cameraAttemptResult, exercise, detection, onSuccess]);

  // Auto-verify jika label yang terdeteksi cocok dengan targetWord, melewati threshold, dan deteksi terkunci
  useEffect(() => {
    if (
      cameraStatus === "active" &&
      !cameraAttemptResult &&
      !submitting &&
      detectionLocked &&
      detection.label.toLowerCase() === targetWord.toLowerCase() &&
      detection.confidence >= threshold
    ) {
      handleVerify();
    }
  }, [
    cameraStatus,
    cameraAttemptResult,
    submitting,
    detectionLocked,
    detection,
    targetWord,
    threshold,
    handleVerify,
  ]);

  const handleNext = () => {
    stopCamera();
    onNext();
  };

  // Determine HUD content
  const renderHUDContent = () => {
    // Model loading — tampil paling awal karena model dimuat segera saat kamera aktif
    if (isModelLoading) {
      return (
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
          <Loader2 size={13} className="animate-spin" />
          Memuat Model ONNX &amp; MediaPipe...
        </span>
      );
    }

    if (modelError) {
      return (
        <span className="text-[11px] font-bold text-red-400">
          Error: {modelError}
        </span>
      );
    }

    if (countdown !== null) {
      // Countdown sedang berjalan
      return (
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 text-xs font-extrabold text-amber-300 animate-pulse">
            {countdown}
          </span>
          Bersiap... Siapkan gestur Anda!
        </span>
      );
    }

    if (!detectionStarted) {
      // Model sudah siap, menunggu user menekan tombol
      return (
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
          <CheckCircle2 size={13} />
          Model siap
        </span>
      );
    }

    if (detectionLocked) {
      if (isWrong) {
        const isIdle = detection.label.toLowerCase() === "idle";
        return (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[11px] font-bold text-white">
              Belum Sesuai:{" "}
              <span className="text-red-300 uppercase">
                {isIdle ? "IDLE (DIAM)" : detection.label}
              </span>{" "}
              {!isIdle && `(${(detection.confidence * 100).toFixed(0)}%)`}
            </span>
          </div>
        );
      }

      // Hasil sudah terkunci — tampilkan hasil final (benar)
      return (
        <div className="flex items-center gap-2">
          <Lock size={12} className="text-emerald-400" />
          <span className="text-[11px] font-bold text-white">
            Hasil:{" "}
            <span className="text-emerald-300 uppercase">
              {detection.label}
            </span>{" "}
            ({(detection.confidence * 100).toFixed(0)}%)
          </span>
        </div>
      );
    }

    if (detection.bufferProgress < 30) {
      const progressPercent = Math.round((detection.bufferProgress / 30) * 100);
      return (
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-sky-300">
            Tahan gestur Anda... ({progressPercent}%)
          </span>
          <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-bold text-white">
          Terdeteksi:{" "}
          <span className="text-emerald-300 uppercase">{detection.label}</span>{" "}
          ({(detection.confidence * 100).toFixed(0)}%)
        </span>
      </div>
    );
  };

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-[#F66750]">
          <ScanFace size={16} />
          Latihan Kamera AI (ONNX LSTM)
        </span>
        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
          Deteksi Real-Time
        </span>
      </div>

      {/* Guidance Card */}
      <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-3.5 text-xs">
        <p className="font-bold text-slate-800">
          Target Gerakan:{" "}
          <span className="text-[#F66750] text-sm font-extrabold capitalize">
            {targetWord}
          </span>
        </p>
        <p className="mt-1 text-slate-600 leading-relaxed">
          {exercise.instruction ||
            "Peragakan isyarat di depan kamera hingga mencapai 30 frame berurutan."}
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

            {/* Countdown overlay besar di tengah */}
            {countdown !== null && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-7xl font-extrabold text-white drop-shadow-lg animate-pulse">
                    {countdown}
                  </span>
                  <span className="text-sm font-semibold text-white/80">
                    Siapkan gestur Anda!
                  </span>
                </div>
              </div>
            )}

            {/* HUD Overlay Status Model & Prediksi */}
            <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5 rounded-xl bg-black/65 px-3 py-2 backdrop-blur">
              {renderHUDContent()}
            </div>

            <div className="pointer-events-none absolute inset-x-8 inset-y-10 rounded-2xl border-2 border-dashed border-emerald-400/60" />

            {/* Tombol Mulai Deteksi — hanya tampil jika belum mulai & tidak countdown & belum salah */}
            {!detectionStarted &&
              countdown === null &&
              !cameraAttemptResult &&
              !isWrong && (
                <button
                  type="button"
                  onClick={handleStartDetection}
                  disabled={!isModelReady}
                  className="absolute bottom-14 left-1/2 z-10 -translate-x-1/2 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!isModelReady ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Memuat Model...
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Mulai Deteksi
                    </>
                  )}
                </button>
              )}

            {/* Tombol / Box Mengulang ketika salah di dalam box kamera (hanya tampil jika salah & belum benar) */}

            <button
              type="button"
              onClick={handleStopCamera}
              className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-black/80 z-20"
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
              {cameraStatus === "loading"
                ? "Meminta izin..."
                : "Aktifkan Kamera AI"}
            </button>
            {cameraMessage && (
              <p className="text-[11px] text-amber-300 max-w-xs">
                {cameraMessage}
              </p>
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
          isWrong ? (
            <button
              type="button"
              onClick={handleRetry}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-500 text-xs font-bold text-white shadow-md shadow-red-500/30 transition hover:brightness-105 active:scale-95 md:text-sm"
            >
              <RotateCcw size={16} />
              Gerakan Belum Tepat, Coba Ulangi
            </button>
          ) : (
            <button
              type="button"
              disabled={
                cameraStatus !== "active" ||
                submitting ||
                isModelLoading ||
                !detectionLocked
              }
              onClick={handleVerify}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold text-white shadow-md shadow-orange-500/25 transition enabled:hover:brightness-105 disabled:opacity-50 md:text-sm"
              style={{ background: GRADIENT_BRAND }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memverifikasi Gestur Tangan...
                </>
              ) : !detectionStarted ? (
                <>
                  <Play size={18} />
                  Mulai Deteksi Terlebih Dahulu
                </>
              ) : !detectionLocked ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Menunggu Hasil Deteksi...
                </>
              ) : (
                <>
                  <ScanFace size={18} />
                  Verifikasi Gerakan Kamera AI (+50 XP)
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-500/30 transition hover:brightness-105 md:text-sm"
          >
            Selesaikan Level &amp; Buka Level Berikutnya
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </section>
  );
};
