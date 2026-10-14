'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Lock,
  MessageSquare,
  ScanFace,
  VideoOff,
} from "lucide-react";
import BarMenu from "@/components/BarMenu";
import Navbar from "@/components/Navbar";
import KuisCepat from "@/components/KuisCepat";

const GRADIENT_ORANGE =
  "linear-gradient(117.21deg, #FA8C3F 33.02%, #FF3030 109.3%)";
const GRADIENT_BRAND = "linear-gradient(135deg, #F66750 0%, #F97316 100%)";

const categories = [
  { id: "abjad", label: "Abjad A-Z", symbol: "A" },
  { id: "kata", label: "Kata Hari", symbol: null },
  { id: "angka", label: "Angka", symbol: "0" },
] as const;

type CategoryId = (typeof categories)[number]["id"];
type StepId = "flashcard" | "video" | "kamera";
type CameraStatus = "idle" | "loading" | "active" | "denied" | "error";

const levels = [
  {
    code: "L1",
    title: "Level 1: Abjad Ejaan Jari",
    meta: "Aktif • 80% Selesai",
    action: "Lanjut",
    state: "active",
  },
  {
    code: "L2",
    title: "Level 2: Angka & Hitungan",
    meta: "Terbuka • 20% Selesai",
    action: "Buka",
    state: "open",
  },
  {
    code: null,
    title: "Level 3: Percakapan Sehari-hari",
    meta: "Terkunci",
    action: null,
    state: "locked",
  },
] as const;

/* Tombol Sebelumnya + Verifikasi & Lanjut */
const StepActions = ({
  onPrev,
  onVerify,
  prevDisabled = true,
}: {
  onPrev?: () => void;
  onVerify: () => void;
  prevDisabled?: boolean;
}) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={onPrev}
      disabled={prevDisabled}
      className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-slate-100 text-xs font-semibold text-slate-500 transition enabled:hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70 md:text-sm"
    >
      <ChevronLeft size={16} aria-hidden="true" />
      Sebelumnya
    </button>
    <button
      type="button"
      onClick={onVerify}
      className="flex h-12 flex-[1.6] items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105 active:scale-[0.99] md:text-sm"
      style={{ background: GRADIENT_BRAND }}
    >
      Verifikasi &amp; Lanjut (+10 XP)
      <ChevronRight size={16} aria-hidden="true" />
    </button>
  </div>
);

const BelajarPage = () => {
  const [active, setActive] = useState<CategoryId>("abjad");
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [cameraMessage, setCameraMessage] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /* Matikan kamera */
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  /* Matikan kamera saat meninggalkan halaman */
  useEffect(() => stopCamera, [stopCamera]);

  /* Pasang stream ke <video> setelah elemennya tampil */
  useEffect(() => {
    if (cameraStatus === "active" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraStatus]);

  /* Minta izin + buka kamera */
  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("error");
      setCameraMessage(
        "Browser tidak mendukung kamera, atau halaman tidak memakai HTTPS."
      );
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
        setCameraMessage(
          "Izin kamera ditolak. Aktifkan izin kamera di pengaturan browser, lalu coba lagi."
        );
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setCameraStatus("error");
        setCameraMessage("Kamera tidak ditemukan di perangkat ini.");
      } else {
        setCameraStatus("error");
        setCameraMessage(
          "Kamera tidak dapat dibuka. Mungkin sedang dipakai aplikasi lain."
        );
      }
    }
  };

  const handleStopCamera = () => {
    stopCamera();
    setCameraStatus("idle");
    setCameraMessage("");
  };

  /* TODO: arahkan ke flow berikutnya sesuai step */
  const handleVerify = (step: StepId) => {
    console.log("Verifikasi & Lanjut:", step);
  };

  const cameraActive = cameraStatus === "active";

  return (
    <>
      <Navbar />

      <main className="flex flex-1 flex-col items-center bg-[#F8FAFC] px-4 py-5 mb-16 md:py-8">
        <div className="flex w-full max-w-md flex-col gap-6 md:max-w-2xl">
          {/* Hero */}
          <section
            className="rounded-3xl p-5 text-white shadow-lg shadow-orange-500/20 md:p-8"
            style={{ background: GRADIENT_ORANGE }}
          >
            <span className="inline-block rounded-full bg-white/25 px-3 py-1 text-[11px] font-bold uppercase tracking-wider md:text-xs">
              Modul Praktik
            </span>
            <h1 className="mt-3 text-xl font-bold leading-tight md:text-3xl">
              Pusat Belajar Bahasa Isyarat
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-white/85 md:text-base">
              Pelajari gestur isyarat lewat flashcard animasi, kamera latihan
              AI, dan tes kuis poin.
            </p>
          </section>

          {/* Kategori */}
          <section className="flex flex-col gap-3">
            <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400 md:text-sm">
              Kategori Isyarat
            </h2>

            <div
              role="tablist"
              aria-label="Kategori isyarat"
              className="grid grid-cols-3 gap-3"
            >
              {categories.map(({ id, label, symbol }) => {
                const isActive = active === id;

                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(id)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-4 transition md:py-6 ${
                      isActive
                        ? "border-[#F66750] bg-[#F66750] text-white shadow-md shadow-orange-500/25"
                        : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:shadow-sm"
                    }`}
                  >
                    {symbol ? (
                      <span className="text-2xl font-medium leading-none">
                        {symbol}
                      </span>
                    ) : (
                      <MessageSquare
                        size={24}
                        fill="currentColor"
                        className="text-amber-400"
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-xs font-bold md:text-sm">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Flashcard & Player Isyarat */}
          <section
            aria-labelledby="flashcard-title"
            className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm md:p-4"
          >
            <div className="flex items-center justify-between gap-2 px-1 pt-1">
              <h2
                id="flashcard-title"
                className="flex items-center gap-2 text-sm font-bold text-slate-900 md:text-base"
              >
                <span
                  className="h-2 w-2 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                Flashcard &amp; Player Isyarat
              </h2>
              <span className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-bold text-[#F66750]">
                BISINDO Standard
              </span>
            </div>

            <Image
              src="/bannerflash.png"
              alt="Flashcard isyarat huruf A"
              width={0}
              height={0}
              sizes="(min-width: 768px) 42rem, 100vw"
              className="h-auto w-full rounded-2xl"
              priority
            />

            <StepActions onVerify={() => handleVerify("flashcard")} />
          </section>

          {/* Video Peraga */}
          <section
            aria-labelledby="video-title"
            className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm md:p-4"
          >
            <h2
              id="video-title"
              className="px-1 pt-1 text-sm font-bold text-slate-900 md:text-base"
            >
              Video Peraga
            </h2>

            <Image
              src="/bannervidio.png"
              alt="Video peraga isyarat Terima Kasih"
              width={0}
              height={0}
              sizes="(min-width: 768px) 42rem, 100vw"
              className="h-auto w-full rounded-2xl"
            />

            <StepActions onVerify={() => handleVerify("video")} />
          </section>

          {/* Latihan Kamera AI */}
          <section
            aria-labelledby="kamera-title"
            className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                id="kamera-title"
                className="flex items-center gap-2 text-sm font-bold text-slate-900 md:text-base"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-red-50 text-[#F66750]">
                  <ScanFace size={14} aria-hidden="true" />
                </span>
                Latihan Kamera AI
              </h2>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                Deteksi Real-time
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-500 md:text-sm">
              Tunjukkan gerakan tanganmu ke kamera untuk memeriksa ketepatan
              isyarat secara langsung.
            </p>

            {/* Area kamera */}
            <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#101A2E]">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    aria-label="Pratinjau kamera latihan"
                    className="h-full w-full -scale-x-100 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleStopCamera}
                    className="absolute bottom-3 right-3 rounded-lg bg-black/50 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-black/70"
                  >
                    Matikan Kamera
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 px-4 text-center">
                  <VideoOff
                    size={40}
                    className="text-slate-500"
                    aria-hidden="true"
                  />
                  <p className="text-[11px] text-slate-400 md:text-sm">
                    Kamera Latihan AI Belum Aktif
                  </p>

                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={cameraStatus === "loading"}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#F66750] px-4 py-2 text-xs font-bold text-white transition hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
                  >
                    <Camera size={14} aria-hidden="true" />
                    {cameraStatus === "loading"
                      ? "Meminta izin..."
                      : cameraStatus === "denied" || cameraStatus === "error"
                        ? "Coba Lagi"
                        : "Aktifkan Kamera AI"}
                  </button>

                  {cameraMessage && (
                    <p
                      role="alert"
                      className="max-w-xs text-[11px] leading-relaxed text-amber-300"
                    >
                      {cameraMessage}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Tombol muncul setelah kamera berhasil dibuka */}
            {cameraActive && (
              <StepActions onVerify={() => handleVerify("kamera")} />
            )}
          </section>

          {/* Peta level */}
          <section className="flex flex-col gap-3">
            <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400 md:text-sm">
              Peta Level Pembelajaran
            </h2>

            <ul className="flex flex-col gap-3 rounded-3xl bg-white p-3 shadow-sm">
              {levels.map((level) => (
                <li
                  key={level.title}
                  className={`flex items-center gap-3 rounded-2xl border p-3 ${
                    level.state === "active"
                      ? "border-red-200 bg-red-50"
                      : level.state === "open"
                        ? "border-slate-100 bg-slate-50"
                        : "border-slate-100 bg-slate-100/70 opacity-80"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                      level.state === "active"
                        ? "bg-[#F66750] text-white"
                        : level.state === "open"
                          ? "bg-yellow-100 text-amber-600"
                          : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {level.code ?? <Lock size={18} aria-hidden="true" />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-bold ${
                        level.state === "locked"
                          ? "text-slate-500"
                          : "text-slate-800"
                      }`}
                    >
                      {level.title}
                    </p>
                    <p
                      className={`text-[11px] ${
                        level.state === "active"
                          ? "text-[#F66750]"
                          : "text-slate-400"
                      }`}
                    >
                      {level.meta}
                    </p>
                  </div>

                  {level.action && (
                    <span
                      className={`shrink-0 text-xs font-bold ${
                        level.state === "active"
                          ? "text-[#F66750]"
                          : "text-slate-400"
                      }`}
                    >
                      {level.action}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
          <KuisCepat />
        </div>
      </main>

      <BarMenu />
    </>
  );
};

export default BelajarPage;