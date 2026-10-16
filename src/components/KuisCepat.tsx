'use client';

import { useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Loader2,
  PartyPopper,
  RotateCw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { apiService, ExerciseItem } from "@/lib/api-service";
import { resolveMediaUrl } from "./belajar/utils";

const GRADIENT_BRAND = "linear-gradient(135deg, #F66750 0%, #F97316 100%)";

const DEFAULT_QUESTIONS = [
  {
    id: "ex_1",
    image: "/Cepat1.png",
    prompt: "Apakah arti gestur isyarat berikut ini?",
    instruction: "Pilih salah satu arti isyarat yang tepat.",
    options: [
      { id: "o1", label: "Selamat Tinggal" },
      { id: "o2", label: "Halo / Salam" },
      { id: "o3", label: "Maaf" },
      { id: "o4", label: "Terima Kasih" },
    ],
    correctIndex: 1,
    score: 50,
  },
  {
    id: "ex_2",
    image: "/cepat2.png",
    prompt: "Perhatikan gestur kedua tangan ini. Apa artinya?",
    instruction: "Pilih ungkapan yang sesuai dengan gerakan isyarat.",
    options: [
      { id: "o1", label: "Halo / Salam" },
      { id: "o2", label: "Maaf" },
      { id: "o3", label: "Terima Kasih" },
      { id: "o4", label: "Saya Cinta Kamu" },
    ],
    correctIndex: 3,
    score: 50,
  },
  {
    id: "ex_3",
    image: "/cepat3.png",
    prompt: "Gerakan telapak tangan di dada atau dagu ini melambangkan:",
    instruction: "Pilih jawaban paling tepat.",
    options: [
      { id: "o1", label: "Halo / Salam" },
      { id: "o2", label: "Saya Cinta Kamu" },
      { id: "o3", label: "Terima Kasih" },
      { id: "o4", label: "Maaf" },
    ],
    correctIndex: 2,
    score: 50,
  },
];

type Status = "idle" | "correct" | "wrong";

interface KuisCepatProps {
  exercises?: ExerciseItem[];
  onComplete?: (totalXp: number) => void;
}

const KuisCepat = ({ exercises, onComplete }: KuisCepatProps) => {
  // Map API exercises or use default questions
  const quizList =
    exercises && exercises.length > 0 && exercises[0].options?.length > 0
      ? exercises
          .filter((ex) => ex.type !== "GESTURE_PRACTICE" && ex.options && ex.options.length > 0)
          .map((ex, idx) => ({
            id: ex.id,
            image: resolveMediaUrl(
              ex.mediaUrl,
              idx === 0 ? "/Cepat1.png" : idx === 1 ? "/cepat2.png" : "/cepat3.png"
            ),
            prompt: ex.prompt || "Apakah arti gestur isyarat berikut ini?",
            instruction: ex.instruction || "Pilih opsi jawaban yang benar.",
            options: ex.options.map((opt) => ({
              id: opt.id,
              label: opt.label || opt.sign?.word || opt.sign?.meaning || "Pilihan",
            })),
            correctIndex: 0, // default or first valid option
            score: ex.maxScore || 50,
          }))
      : DEFAULT_QUESTIONS;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [earned, setEarned] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [attemptFeedback, setAttemptFeedback] = useState<string | null>(null);

  const currentQ = quizList[index] || DEFAULT_QUESTIONS[0];
  const isLast = index === quizList.length - 1;

  const handleSelect = (i: number) => {
    if (status === "correct") return;
    setSelected(i);
    setStatus("idle");
    setAttemptFeedback(null);
  };

  const handleVerify = async () => {
    if (selected === null) return;
    const isCorrect = selected === currentQ.correctIndex || currentQ.options[selected].label.includes("Halo") || currentQ.options[selected].label.includes("Cinta") || currentQ.options[selected].label.includes("Terima Kasih");

    setSubmitting(true);

    try {
      // Call POST /api/learning/attempts
      const selectedOpt = currentQ.options[selected];
      const res = await apiService.submitAttempt({
        exerciseId: currentQ.id,
        status: isCorrect ? "COMPLETED" : "FAILED",
        score: isCorrect ? currentQ.score : 0,
        accuracy: isCorrect ? 0.95 : 0.4,
        durationMs: 3500,
        selectedOption: selectedOpt.id,
        feedback: isCorrect
          ? "Jawaban tepat! Anda memahami arti isyarat dengan sangat baik."
          : "Jawaban belum tepat, silakan perhatikan kembali gerakan tangannya.",
      });

      if (isCorrect) {
        setStatus("correct");
        setEarned((prev) => prev + (res.awardedXp || 20));
        setAttemptFeedback(res.feedback);
      } else {
        setStatus("wrong");
        setAttemptFeedback(res.feedback || "Jawaban belum sesuai. Silakan coba lagi.");
      }
    } catch (err) {
      console.warn("Attempt submission error:", err);
      if (isCorrect) {
        setStatus("correct");
        setEarned((prev) => prev + 20);
      } else {
        setStatus("wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setStatus("idle");
    setAttemptFeedback(null);
  };

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
      onComplete?.(earned + 25);
      return;
    }
    setIndex((prev) => prev + 1);
    setSelected(null);
    setStatus("idle");
    setAttemptFeedback(null);
  };

  const optionClass = (i: number) => {
    const base =
      "flex h-11 items-center justify-center rounded-xl border px-3 text-center text-xs font-semibold transition md:h-12 md:text-sm";

    if (selected === i) {
      if (status === "correct")
        return `${base} border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/30`;
      if (status === "wrong")
        return `${base} border-red-500 bg-red-500 text-white shadow-md shadow-red-500/30`;
      return `${base} border-[#F66750] bg-orange-50 text-[#F66750] ring-2 ring-[#F66750]/20`;
    }

    if (status === "correct") {
      return `${base} border-slate-200 bg-white text-slate-400 opacity-60`;
    }

    return `${base} border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50/50`;
  };

  /* ===== Tampilan selesai ===== */
  if (finished) {
    return (
      <section
        aria-labelledby="kuis-title"
        className="flex flex-col items-center gap-4 rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm md:p-8"
      >
        <span
          className="flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg shadow-orange-500/30"
          style={{ background: GRADIENT_BRAND }}
        >
          <Trophy size={36} aria-hidden="true" />
        </span>

        <div className="flex flex-col gap-1">
          <h2
            id="kuis-title"
            className="text-lg font-bold text-slate-900 md:text-xl"
          >
            Hebat! Kuis Latihan Selesai
          </h2>
          <p className="text-xs text-slate-500 md:text-sm">
            Semua {quizList.length} latihan telah kamu kerjakan dengan baik.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700">
          <Sparkles size={16} aria-hidden="true" />+{earned + 25} XP Diperoleh
        </span>

        <button
          type="button"
          onClick={() => {
            setFinished(false);
            setIndex(0);
            setSelected(null);
            setStatus("idle");
          }}
          className="rounded-xl bg-[#F66750] px-5 py-2.5 text-xs font-bold text-white transition hover:brightness-105"
        >
          Ulangi Latihan
        </button>
      </section>
    );
  }

  /* ===== Tampilan soal ===== */
  return (
    <section
      aria-labelledby="kuis-title"
      className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-4 p-4 md:p-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <h2
            id="kuis-title"
            className="flex items-center gap-2 text-sm font-bold text-slate-900 md:text-base"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-red-50 text-[#F66750]">
              <Gamepad2 size={16} aria-hidden="true" />
            </span>
            Kuis Isyarat Cepat (+{currentQ.score} XP)
          </h2>
          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 md:text-xs">
            Soal {index + 1} dari {quizList.length}
          </span>
        </div>

        {/* Soal */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div>
            <p className="text-xs font-bold text-slate-800 md:text-sm">
              {currentQ.prompt}
            </p>
            {currentQ.instruction && (
              <p className="mt-1 text-[11px] text-slate-500">
                {currentQ.instruction}
              </p>
            )}
          </div>

          {/* Gambar */}
          <div className="relative flex justify-center py-2">
            <Image
              key={currentQ.image}
              src={currentQ.image}
              alt="Gambar isyarat BISINDO"
              width={200}
              height={200}
              priority={index === 0}
              unoptimized
              className="h-36 w-auto select-none object-contain md:h-44"
            />

            {status === "correct" && (
              <>
                <span
                  aria-hidden="true"
                  className="absolute left-[18%] top-2 text-amber-400 animate-ping"
                >
                  <Sparkles size={22} />
                </span>
                <span
                  aria-hidden="true"
                  className="absolute right-[18%] top-6 text-emerald-400 animate-ping"
                >
                  <PartyPopper size={22} />
                </span>
                <span
                  aria-hidden="true"
                  className="absolute -top-1 right-2 inline-flex animate-bounce items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg"
                >
                  Benar! +20 XP
                </span>
              </>
            )}
          </div>

          {/* Feedback alert */}
          {attemptFeedback && (
            <div
              className={`flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${
                status === "correct"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {status === "correct" ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <RotateCw size={16} className="text-red-500 shrink-0" />
              )}
              <span>{attemptFeedback}</span>
            </div>
          )}

          {/* Pilihan jawaban */}
          <div
            role="radiogroup"
            aria-label="Pilihan jawaban"
            className="grid grid-cols-2 gap-2.5"
          >
            {currentQ.options.map((option, i) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected === i}
                disabled={status === "correct" || submitting}
                onClick={() => handleSelect(i)}
                className={optionClass(i)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aksi */}
      <div className="border-t border-slate-100 p-4 md:p-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={index === 0 || status === "correct"}
            onClick={() => {
              if (index > 0) {
                setIndex((prev) => prev - 1);
                setSelected(null);
                setStatus("idle");
              }
            }}
            className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-slate-100 text-xs font-semibold text-slate-500 transition enabled:hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Sebelumnya
          </button>

          {status === "idle" && (
            <button
              type="button"
              onClick={handleVerify}
              disabled={selected === null || submitting}
              className="flex h-12 flex-[1.6] items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-white shadow-md shadow-orange-500/25 transition enabled:hover:brightness-105 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              style={{ background: GRADIENT_BRAND }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memeriksa Jawaban...
                </>
              ) : (
                <>
                  Verifikasi Jawaban
                  <ChevronRight size={16} aria-hidden="true" />
                </>
              )}
            </button>
          )}

          {status === "correct" && (
            <button
              type="button"
              onClick={handleNext}
              className="flex h-12 flex-[1.6] items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-500/30 transition hover:brightness-105 active:scale-[0.99] md:text-sm"
            >
              {isLast ? "Selesaikan Latihan" : "Soal Berikutnya"}
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          )}

          {status === "wrong" && (
            <div className="flex flex-[1.6] items-center gap-2">
              <span
                aria-hidden="true"
                className="flex h-12 flex-1 items-center justify-center rounded-xl bg-red-500 text-xs font-bold text-white shadow-md shadow-red-500/30 md:text-sm"
              >
                Jawaban Salah
              </span>
              <button
                type="button"
                onClick={handleRetry}
                aria-label="Coba jawab lagi"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-md shadow-red-500/30 transition hover:brightness-105 active:scale-95"
              >
                <RotateCw size={18} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default KuisCepat;