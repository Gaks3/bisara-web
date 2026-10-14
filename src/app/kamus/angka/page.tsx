'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BarMenu from "@/components/BarMenu";
import Navbar from "@/components/Navbar";

const GRADIENT_BRAND = "linear-gradient(135deg, #F66750 0%, #F97316 100%)";

/* Isi `deskripsi` untuk menjelaskan gerakan tiap angka (opsional) */
const angka: { nilai: string; kata: string; deskripsi?: string }[] = [
  { 
    nilai: "1", 
    kata: "Satu", 
    deskripsi: "Jari telunjuk menunjuk ke atas." 
  },
  { 
    nilai: "2", 
    kata: "Dua", 
    deskripsi: "Jari telunjuk dan jari tengah diangkat." 
  },
  { 
    nilai: "3", 
    kata: "Tiga", 
    deskripsi: "Tiga jari diangkat (telunjuk, tengah, manis)." 
  },
  { 
    nilai: "4", 
    kata: "Empat", 
    deskripsi: "Empat jari diangkat, ibu jari ditekuk." 
  },
  { 
    nilai: "5", 
    kata: "Lima", 
    deskripsi: "Telapak tangan terbuka, semua jari direntangkan." 
  },
  { 
    nilai: "6", 
    kata: "Enam", 
    deskripsi: "Telapak tangan terbuka (5) + ibu jari tangan lain menunjuk (menandakan tambahan 1)." 
  },
  { 
    nilai: "7", 
    kata: "Tujuh", 
    deskripsi: "Telapak tangan terbuka (5) + dua jari tangan lain diangkat." 
  },
  { 
    nilai: "8", 
    kata: "Delapan", 
    deskripsi: "Telapak tangan terbuka (5) + tiga jari tangan lain diangkat." 
  },
  { 
    nilai: "9", 
    kata: "Sembilan", 
    deskripsi: "Dua telapak tangan terbuka menghadap depan (5 + 4)." 
  },
  { 
    nilai: "10", 
    kata: "Sepuluh", 
    deskripsi: "Dua telapak tangan terbuka sejajar (melambangkan sepuluh)." 
  },
  { 
    nilai: "11", 
    kata: "Sebelas", 
    deskripsi: "Isyarat 10 diikuti 1 secara berurutan." 
  },
  { 
    nilai: "20", 
    kata: "Dua Puluh", 
    deskripsi: "Isyarat 2 lalu 0, dilakukan berurutan dari kiri ke kanan." 
  },
  { 
    nilai: "21", 
    kata: "Dua Puluh Satu", 
    deskripsi: "Isyarat 2 lalu 1, ditunjukkan secara berurutan." 
  },
  { 
    nilai: "50", 
    kata: "Lima Puluh", 
    deskripsi: "Isyarat 5 lalu 0." 
  },
  { 
    nilai: "100", 
    kata: "Seratus", 
    deskripsi: "Isyarat 1 lalu 0, diulang dengan penekanan (menunjukkan ratus)." 
  },
  { 
    nilai: "200", 
    kata: "Dua Ratus", 
    deskripsi: "Isyarat 2 lalu 0, menunjukkan dua ratus." 
  },
  { 
    nilai: "201", 
    kata: "Dua Ratus Satu", 
    deskripsi: "Isyarat 2 → 0 → 1 dilakukan berurutan." 
  },
  { 
    nilai: "500", 
    kata: "Lima Ratus", 
    deskripsi: "Isyarat 5 → 0 dengan gerakan lebih tegas." 
  },
  { 
    nilai: "1000", 
    kata: "Seribu", 
    deskripsi: "Isyarat 1 → 0 → 0 → 0, ditunjukkan dengan rangkaian gerakan." 
  },
  { 
    nilai: "2000", 
    kata: "Dua Ribu", 
    deskripsi: "Isyarat 2 → 0 → 0 → 0." 
  },
];

const AngkaPage = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (nilai: string) => {
    setSelected(nilai);
    document
      .getElementById(`angka-${nilai}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      <Navbar />

      <main className="flex flex-1 flex-col items-center bg-[#F8FAFC] mb-16 px-4 py-5 md:py-8">
        <div className="flex w-full max-w-md flex-col gap-5 md:max-w-2xl">
          {/* Judul */}
          <div className="px-0.5">
            <h1 className="text-lg font-bold text-slate-900 md:text-2xl">
              Angka Isyarat BISINDO
            </h1>
            <p className="text-xs text-slate-500 md:text-sm">
              Pelajari isyarat angka dari 1 sampai 2000.
            </p>
          </div>

          {/* Gambar utama */}
          <section className="rounded-3xl border border-slate-100 bg-white p-3 shadow-sm md:p-5">
            <Image
              src="/asetangka.png"
              alt="Isyarat angka BISINDO dari 1 sampai 2000"
              width={0}
              height={0}
              sizes="(min-width: 768px) 42rem, 100vw"
              priority
              className="h-auto w-full rounded-2xl"
            />
          </section>

          {/* Pemilih angka */}
          <section className="flex flex-col gap-3">
            <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400 md:text-sm">
              Pilih Angka
            </h2>
            <div
              role="group"
              aria-label="Pilih angka"
              className="grid grid-cols-4 gap-2 rounded-3xl bg-white p-3 shadow-sm md:grid-cols-6"
            >
              {angka.map(({ nilai, kata }) => {
                const active = nilai === selected;
                return (
                  <button
                    key={nilai}
                    type="button"
                    aria-pressed={active}
                    aria-label={`Angka ${nilai}, ${kata}`}
                    onClick={() => handleSelect(nilai)}
                    className={`flex h-11 items-center justify-center rounded-xl text-sm font-bold transition ${
                      active
                        ? "bg-[#F66750] text-white shadow-md shadow-orange-500/25"
                        : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-[#F66750]"
                    }`}
                  >
                    {nilai}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Daftar lengkap */}
          <section className="flex flex-col gap-3">
            <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400 md:text-sm">
              Panduan Lengkap Angka
            </h2>
            <ul className="flex flex-col gap-2 rounded-3xl bg-white p-3 shadow-sm">
              {angka.map(({ nilai, kata, deskripsi }) => (
                <li
                  key={nilai}
                  id={`angka-${nilai}`}
                  className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                    nilai === selected
                      ? "border-red-200 bg-red-50"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <span className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 px-2 text-sm font-extrabold text-[#F66750]">
                    {nilai}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">{kata}</p>
                    <p className="text-xs leading-relaxed text-slate-500 md:text-sm">
                      {deskripsi ?? "Lihat gambar di atas untuk bentuk isyaratnya."}
                    </p>
                  </div>
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

export default AngkaPage;