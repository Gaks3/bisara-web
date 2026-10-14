'use client';

import { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  PartyPopper,
  RotateCw,
  Sparkles,
  Trophy,
} from "lucide-react";

const GRADIENT_BRAND = "linear-gradient(135deg, #F66750 0%, #F97316 100%)";

const XP_PER_QUESTION = 10;
const XP_BONUS = 10; // 4 soal x 10 + bonus 10 = 50 XP

const questions = [
  {
    image: "/Cepat1.png",
    alt: "Isyarat untuk kata Halo",
    options: ["Selamat Tinggal", "Halo / Salam", "Maaf", "Terima Kasih"],
    correct: 1,
  },
  {
    image: "/cepat2.png",
    alt: "Isyarat untuk kalimat Aku suka kamu",
    options: ["Halo / Salam", "Maaf", "Terima Kasih", "Saya Cinta Kamu"],
    correct: 3,
  },
  {
    image: "/cepat3.png",
    alt: "Isyarat untuk kata Terima kasih",
    options: ["Halo / Salam", "Saya Cinta Kamu", "Terima Kasih", "Maaf"],
    correct: 2,
  },
  {
    image: "/cepat4.png",
    alt: "Isyarat untuk kata Selamat tinggal",
    options: ["Selamat Tinggal", "Maaf", "Halo / Salam", "Saya Cinta Kamu"],
    correct: 0,
  },
];



type Status = "idle" | "correct" | "wrong";

const KuisCepat = ({
  onComplete,
}: {
  /** Dipanggil sekali saat kuis selesai, berisi total XP */
  onComplete?: (totalXp: number) => void;
}) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [earned, setEarned] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const totalXp = earned + XP_BONUS;

  const handleSelect = (i: number) => {
    if (status === "correct") return; // sudah benar, kunci jawaban
    setSelected(i);
    setStatus("idle"); // boleh langsung ganti pilihan setelah salah
  };

  const handleVerify = () => {
    if (selected === null) return;

    if (selected === question.correct) {
      setStatus("correct");
      setEarned((prev) => prev + XP_PER_QUESTION);
    } else {
      setStatus("wrong");
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setStatus("idle");
  };

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
      onComplete?.(earned + XP_BONUS);
      return;
    }
    setIndex((prev) => prev + 1);
    setSelected(null);
    setStatus("idle");
  };

  const optionClass = (i: number) => {
    const base =
      "flex h-11 items-center justify-center rounded-xl border px-2 text-center text-xs font-semibold transition md:h-12 md:text-sm";

    if (selected === i) {
      if (status === "correct")
        return `${base} border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/30`;
      if (status === "wrong")
        return `${base} border-red-500 bg-red-500 text-white shadow-md shadow-red-500/30`;
      return `${base} border-amber-400 bg-amber-400 text-slate-900 shadow-md shadow-amber-400/30`;
    }

    if (status === "correct") {
      return `${base} border-slate-200 bg-white text-slate-400 opacity-60`;
    }

    return `${base} border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50`;
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
            Kamu sudah menyelesaikan Kuis Cepat!
          </h2>
          <p className="text-xs text-slate-500 md:text-sm">
            Semua {questions.length} soal berhasil kamu jawab dengan benar.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-600">
          <Sparkles size={16} aria-hidden="true" />+{totalXp} XP
        </span>

        <p role="status" className="sr-only">
          Kuis selesai. Kamu mendapat {totalXp} XP.
        </p>
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
            Kuis Isyarat Cepat (+50 XP)
          </h2>
          <span className="text-[10px] font-bold text-amber-500 md:text-xs">
            Dapatkan Poin!
          </span>
        </div>

        {/* Soal */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-bold text-slate-800 md:text-sm">
            Soal {index + 1}/{questions.length}: Apakah arti gestur isyarat
            berikut ini?
          </p>

          {/* Gambar + gimik benar */}
          <div className="relative flex justify-center">
            <Image
              key={question.image}
              src={question.image}
              alt={question.alt}
              width={200}
              height={200}
              priority={index === 0}
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
                  Benar! +{XP_PER_QUESTION} XP
                </span>
              </>
            )}
          </div>

          {/* Pilihan jawaban */}
          <div
            role="radiogroup"
            aria-label="Pilihan jawaban"
            className="grid grid-cols-2 gap-2.5"
          >
            {question.options.map((option, i) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected === i}
                disabled={status === "correct"}
                onClick={() => handleSelect(i)}
                className={optionClass(i)}
              >
                {option}
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
            disabled
            className="flex h-12 flex-1 cursor-not-allowed items-center justify-center gap-1 rounded-xl bg-slate-100 text-xs font-semibold text-slate-400 md:text-sm"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Sebelumnya
          </button>

          {status === "idle" && (
            <button
              type="button"
              onClick={handleVerify}
              disabled={selected === null}
              className="flex h-12 flex-[1.6] items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-white shadow-md shadow-orange-500/25 transition enabled:hover:brightness-105 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              style={{ background: GRADIENT_BRAND }}
            >
              Verifikasi &amp; Lanjut (+{XP_PER_QUESTION} XP)
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          )}

          {status === "correct" && (
            <button
              type="button"
              onClick={handleNext}
              className="flex h-12 flex-[1.6] items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-500/30 transition hover:brightness-105 active:scale-[0.99] md:text-sm"
            >
              {isLast ? "Benar! Selesaikan Kuis" : "Benar! Soal Berikutnya"}
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          )}

          {status === "wrong" && (
            <div className="flex flex-[1.6] items-center gap-2">
              <span
                aria-hidden="true"
                className="flex h-12 flex-1 items-center justify-center rounded-xl bg-red-500 text-xs font-bold text-white shadow-md shadow-red-500/30 md:text-sm"
              >
                Jawab kamu salah
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

        {/* Pengumuman untuk screen reader */}
        <p role="status" aria-live="polite" className="sr-only">
          {status === "correct" && `Jawaban benar. Kamu mendapat ${XP_PER_QUESTION} XP.`}
          {status === "wrong" && "Jawaban salah. Silakan pilih jawaban lagi."}
        </p>
      </div>
    </section>
  );
};

export default KuisCepat;