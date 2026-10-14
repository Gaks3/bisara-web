'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BarMenu from "@/components/BarMenu";
import Navbar from "@/components/Navbar";

const GRADIENT_BRAND = "linear-gradient(135deg, #F66750 0%, #F97316 100%)";

const abjad: Record<string, string> = {
  A: "Kedua tangan membentuk segitiga, ujung jari bertemu di depan dada.",
  B: "Satu tangan terbuka, tangan lain menyapu atau menyentuh telapak tangan.",
  C: "Satu tangan membentuk lengkungan seperti huruf C.",
  D: "Jari tangan membentuk lingkaran kecil, seperti memegang benda kecil.",
  E: "Tangan terbuka dengan jari-jari agak menekuk ke depan.",
  F: "Satu tangan menunjuk ke bawah, tangan lain sebagai penopang.",
  G: "Satu tangan mengepal, tangan lain menopang dari bawah.",
  H: "Dua jari (telunjuk & tengah) diangkat sejajar ke atas.",
  I: "Jari kelingking diangkat tegak, jari lainnya mengepal.",
  J: "Jari kelingking diangkat lalu digerakkan membentuk lengkungan seperti huruf J.",
  K: "Telunjuk dan jari tengah membentuk huruf V, ibu jari menyentuh jari tengah.",
  L: "Telunjuk lurus ke atas dan ibu jari ke samping hingga membentuk sudut siku-siku.",
  M: "Tiga jari (telunjuk, tengah, manis) diletakkan di atas ibu jari yang tertekuk.",
  N: "Dua jari (telunjuk & tengah) diletakkan di atas ibu jari yang tertekuk.",
  O: "Ujung semua jari bertemu dengan ibu jari membentuk lingkaran seperti huruf O.",
  P: "Seperti huruf K, tetapi tangan diarahkan menghadap ke bawah.",
  Q: "Seperti huruf G, tetapi tangan diarahkan menghadap ke bawah.",
  R: "Telunjuk dan jari tengah disilangkan, jari lainnya mengepal.",
  S: "Tangan mengepal dengan ibu jari menutup di depan jari-jari.",
  T: "Tangan mengepal dengan ibu jari terselip di antara telunjuk dan jari tengah.",
  U: "Telunjuk dan jari tengah diangkat rapat sejajar, jari lainnya mengepal.",
  V: "Telunjuk dan jari tengah diangkat terbuka membentuk huruf V.",
  W: "Tiga jari (telunjuk, tengah, manis) diangkat terbuka membentuk huruf W.",
  X: "Telunjuk ditekuk membentuk kait, jari lainnya mengepal.",
  Y: "Ibu jari dan kelingking direntangkan, jari lainnya mengepal.",
  Z: "Telunjuk menggambar bentuk huruf Z di udara.",
};

const letters = Object.keys(abjad);

const AbjadPage = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (letter: string) => {
    setSelected(letter);
    document
      .getElementById(`huruf-${letter}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      <Navbar />

      <main className="flex flex-1 flex-col items-center bg-[#F8FAFC] px-4 mb-16 py-5 md:py-8">
        <div className="flex w-full max-w-md flex-col gap-5 md:max-w-2xl">
          {/* Judul */}
          <div className="px-0.5">
            <h1 className="text-lg font-bold text-slate-900 md:text-2xl">
              Abjad Isyarat BISINDO
            </h1>
            <p className="text-xs text-slate-500 md:text-sm">
              Pelajari bentuk tangan untuk setiap huruf dari A sampai Z.
            </p>
          </div>

          {/* Gambar utama */}
          <section className="rounded-3xl border border-slate-100 bg-white p-3 shadow-sm md:p-5">
            <Image
              src="/asetabjad.png"
              alt="Seluruh abjad isyarat BISINDO dari huruf A sampai Z"
              width={0}
              height={0}
              sizes="(min-width: 768px) 42rem, 100vw"
              priority
              className="h-auto w-full rounded-2xl"
            />
          </section>

          {/* Pemilih huruf */}
          <section className="flex flex-col gap-3">
            <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400 md:text-sm">
              Pilih Huruf
            </h2>
            <div
              role="group"
              aria-label="Pilih huruf"
              className="grid grid-cols-7 gap-2 rounded-3xl bg-white p-3 shadow-sm md:grid-cols-9"
            >
              {letters.map((letter) => {
                const active = letter === selected;
                return (
                  <button
                    key={letter}
                    type="button"
                    aria-pressed={active}
                    aria-label={`Huruf ${letter}`}
                    onClick={() => handleSelect(letter)}
                    className={`flex aspect-square items-center justify-center rounded-xl text-sm font-bold transition ${
                      active
                        ? "bg-[#F66750] text-white shadow-md shadow-orange-500/25"
                        : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-[#F66750]"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Panduan lengkap */}
          <section className="flex flex-col gap-3">
            <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400 md:text-sm">
              Panduan Lengkap A-Z
            </h2>
            <ul className="flex flex-col gap-2 rounded-3xl bg-white p-3 shadow-sm">
              {letters.map((letter) => (
                <li
                  key={letter}
                  id={`huruf-${letter}`}
                  className={`flex items-start gap-3 rounded-2xl border p-3 transition ${
                    letter === selected
                      ? "border-red-200 bg-red-50"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-sm font-extrabold text-[#F66750]">
                    {letter}
                  </span>
                  <p className="text-xs leading-relaxed text-slate-600 md:text-sm">
                    {abjad[letter]}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Kembali */}
          <Link
            href="/kamus"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105 active:scale-[0.99]"
            style={{ background: GRADIENT_BRAND }}
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Kembali ke Kamus
          </Link>
        </div>
      </main>

      <BarMenu />
    </>
  );
};

export default AbjadPage;