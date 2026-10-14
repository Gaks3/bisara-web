'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Hand,
  HandMetal,
  Activity,
  Hash,
  X,
  Construction,
  type LucideIcon,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import BarMenu from "@/components/BarMenu";

const GRADIENT_BRAND = "linear-gradient(135deg, #F66750 0%, #F97316 100%)";

const categories: {
  label: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}[] = [
  { label: "Abjad", href: "/kamus/abjad", icon: Hand },
  { label: "Salam", href: "/kamus/salam", icon: HandMetal, comingSoon: true },
  {
    label: "Aktivitas",
    href: "/kamus/aktivitas",
    icon: Activity,
    comingSoon: true,
  },
  { label: "Angka", href: "/kamus/angka", icon: Hash },
];

const categoryCardClass =
  "flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-1 py-3.5 shadow-sm transition hover:border-red-200 hover:shadow-md md:py-5";

const KamusPage = () => {
  // State untuk mengontrol popup video aktif ("terima-kasih" | "minta-maaf" | null)
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);

  // State untuk modal "fitur segera tersedia" (berisi nama kategori, atau null)
  const [comingSoonModal, setComingSoonModal] = useState<string | null>(null);

  return (
    <>
      <Navbar />

      <main className="flex flex-1 flex-col items-center mb-16 bg-[#F8FAFC] px-4 py-5 md:py-8">
        <div className="flex w-full max-w-md flex-col gap-5 md:max-w-2xl">
          {/* Header kategori */}
          <div className="flex items-center justify-between px-0.5">
            <h1 className="text-base font-bold text-slate-800 md:text-lg">
              Kategori Kosakata
            </h1>
            <Link
              href="/kamus/semua"
              className="text-xs font-semibold text-[#F66750] hover:underline md:text-sm"
            >
              Lihat Semua (40)
            </Link>
          </div>

          {/* Kartu tantangan harian */}
          <section
            className="relative overflow-hidden rounded-3xl p-5 text-white shadow-lg shadow-orange-500/20 md:p-6"
            style={{ background: GRADIENT_BRAND }}
          >
            <Image
              src="/iconkamus.svg"
              alt=""
              aria-hidden="true"
              width={120}
              height={120}
              className="pointer-events-none absolute -bottom-4 -right-3 h-28 w-28 opacity-25 md:h-36 md:w-36"
            />

            <div className="relative flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-white/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider md:text-xs">
                  Tantangan Harian
                </span>
                <span className="text-xs font-medium text-white/90 md:text-sm">
                  +50 XP Bonus
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-bold leading-tight md:text-2xl">
                  Kuasai 5 Abjad Vokal Hari Ini
                </h2>
                <p className="max-w-[17rem] text-xs leading-relaxed text-white/90 md:max-w-sm md:text-sm">
                  Latih isyarat A, E, I, O, U untuk mempertahankan streak
                  belajar harianmu.
                </p>
              </div>

              <div className="mt-1 flex flex-wrap gap-2.5">
                <Link
                  href="/belajar"
                  className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 md:text-sm"
                >
                  Mulai Latihan
                </Link>
                <button
                  type="button"
                  className="rounded-xl bg-black/20 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-black/30 md:text-sm"
                >
                  Klaim Hadiah
                </button>
              </div>
            </div>
          </section>

          {/* Kategori */}
          <nav aria-label="Kategori kosakata">
            <ul className="grid grid-cols-4 gap-2.5 md:gap-4">
              {categories.map(({ label, href, icon: Icon, comingSoon }) => {
                const content = (
                  <>
                    <Icon
                      size={24}
                      strokeWidth={1.75}
                      className="text-[#F66750]"
                      aria-hidden="true"
                    />
                    <span className="text-[11px] font-semibold text-slate-700 md:text-sm">
                      {label}
                    </span>
                  </>
                );

                return (
                  <li key={label}>
                    {comingSoon ? (
                      <button
                        type="button"
                        onClick={() => setComingSoonModal(label)}
                        className={categoryCardClass}
                      >
                        {content}
                      </button>
                    ) : (
                      <Link href={href} className={categoryCardClass}>
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Isyarat pilihan hari ini */}
          <div className="flex flex-col gap-4">
            
            {/* Card 1: Terima Kasih */}
            <article className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
              <header className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#F66750] md:text-xs">
                  Isyarat Pilihan Hari Ini
                </p>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600 md:text-xs">
                  Tingkat Pemula
                </span>
              </header>

              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-red-50 p-2 md:h-24 md:w-24">
                  <Image
                    src="/iconterima.svg"
                    alt="Isyarat Terima Kasih"
                    width={64}
                    height={64}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-slate-900 md:text-xl">
                    Terima Kasih
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 md:text-sm">
                    Sentuhkan ujung jemari ke bibir atau dagu lalu gerakkan maju ke lawan bicara.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveVideoModal("terima-kasih")}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
              >
                Pelajari Gerakan Lengkap
              </button>
            </article>

            {/* Card 2: Minta Maaf */}
            <article className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
              <header className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#F66750] md:text-xs">
                  Isyarat Pilihan Hari Ini
                </p>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600 md:text-xs">
                  Tingkat Pemula
                </span>
              </header>

              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-red-50 p-4 md:h-24 md:w-24">
                  <Image
                    src="/iconmaaf.svg"
                    alt="Isyarat Minta Maaf"
                    width={64}
                    height={64}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-slate-900 md:text-xl">
                    Minta Maaf
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 md:text-sm">
                    Mengepalkan tangan membentuk huruf "A" lalu digerakkan melingkar di atas dada
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveVideoModal("minta-maaf")}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
              >
                Pelajari Gerakan Lengkap
              </button>
            </article>

          </div>
        </div>
      </main>

      {/* POPUP MODAL VIDEO */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-base font-bold text-slate-900 md:text-lg">
                {activeVideoModal === "terima-kasih"
                  ? "Gerakan: Terima Kasih"
                  : "Gerakan: Minta Maaf"}
              </h3>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player (Loop & AutoPlay) */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900">
              <video
                src={
                  activeVideoModal === "terima-kasih"
                    ? "/vidioterimakasih.mp4"
                    : "/vidiomaaf.mp4"
                }
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            </div>

            {/* Tombol Tutup Alternatif */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#F66750] text-sm font-bold text-white transition hover:bg-[#e0563f]"
              >
                Selesai Belajar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL FITUR SEGERA TERSEDIA */}
      {comingSoonModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setComingSoonModal(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="coming-soon-title"
        >
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setComingSoonModal(null)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              aria-label="Tutup"
            >
              <X size={20} />
            </button>

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <Construction
                size={32}
                strokeWidth={1.75}
                className="text-[#F66750]"
                aria-hidden="true"
              />
            </div>

            <h3
              id="coming-soon-title"
              className="text-base font-bold text-slate-900 md:text-lg"
            >
              Mohon Maaf
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Fitur kategori <span className="font-semibold">{comingSoonModal}</span>{" "}
              akan segera tersedia.
            </p>

            <button
              type="button"
              onClick={() => setComingSoonModal(null)}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#F66750] text-sm font-bold text-white transition hover:bg-[#e0563f]"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      <BarMenu />
    </>
  );
};

export default KamusPage;