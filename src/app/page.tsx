  'use client';
  
  import {useState} from "react";
  import Image from "next/image";
  import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

  export default function Home() {
      const [active, setActive] = useState(0);

      const fitur = [
        {
          judul: "Kelas Isyarat Interaktif",
          deskripsi:
            "Pelajari kosakata dasar hingga percakapan lengkap lewat video tutorial resolusi tinggi dan visualisasi ramah Tuna Wicara & Tuna Rungu.",
          icon: "/icontangan2.svg",
        },
        {
          judul: "Deteksi Gerakan AI/Kamera",
          deskripsi:
            "Latih gerakan tanganmu secara langsung di depan kamera. AI Bisara akan memberikan umpan balik akurasi secara realtime!",
          icon: "/iconcamera.svg",
        },
        {
          judul: "Komunitas Inklusif & Aksesibilitas",
          deskripsi:
            "Ruang diskusi bebas hambatan untuk menghubungkan Teman Tuli dan Teman Dengar.",
          icon: "/iconchat.svg",
        },
      ];

  const item = fitur[active];
    return (
    <>
      <Navbar />

        {/* Konten utama halaman */}
        <main className="flex flex-col items-center gap-6 bg-[#F8FAFC] px-6 py-6">

          {/* Card Selamat Datang */}
          <div className="mx-auto w-full max-w-[402px] rounded-[32px] border-[6px] border-[#FFDDD7] bg-white p-4 shadow-sm">
            <div className="flex flex-row items-center gap-3">

              {/* Maskot */}
              <div className="w-[45%] shrink-0">
                <Image
                  src="/karakterSapaan.svg"
                  alt="Maskot Selamat Datang"
                  width={240}
                  height={240}
                  className="h-[240px] w-full object-contain"
                />
              </div>

              {/* Teks */}
              <div className="min-w-0 flex-1">
                <h1 className="mb-3 text-[24px] font-bold leading-tight text-[#FF803F]">
                  Selamat<br />Datang!
                </h1>

                <p className="text-[12px] leading-[1.8] text-[#FF803F]">
                  Akses dashboard Anda untuk mengelola proyek, analitik,
                  dan tim dalam satu tempat terpadu. Kenali fitur-fitur
                  Bisara melalui pratinjau berikut ini!
                </p>
              </div>

            </div>
          </div>

          {/* Bagian hero / Belajar Bahasa Isyarat */}
          <section className="flex w-full flex-col items-center px-6 py-[8px]">

              {/* 1. Ikon dan label */}
              <div className="relative flex flex-col items-center">
                <div className="flex h-[144px] w-[144px] items-center justify-center rounded-full border-[10px] border-[#FFDDD7] bg-gradient-to-tr from-[#F66750] to-[#FB923C]">
                  {/* Ikon tangan */}
                  <Image
                    src="/icontangan1.svg"
                    alt="icon tangan"
                    width={80}
                    height={80}
                    className="h-[60px] w-[60px] object-contain"
                  />
                </div>

                <span className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2 whitespace-nowrap rounded-full border border-[#FFE1DC] bg-white px-5 py-1 text-[13px] font-bold text-[#E0533C] shadow-md">
                  Sentuh Tangan!
                </span>
              </div>

              {/* 2. Badge */}
              <div className="mt-7 rounded-full border border-[#FFE1DC] bg-[#FFF2F0] px-6 py-2">
                <p className="text-[13px] font-medium font-bold text-[#E0533C]">
                  BISINDO Friendly
                </p>
              </div>

              {/* 3. Judul utama */}
              <h2 className="mt-5 text-center text-[32px] font-bold leading-tight text-[#5D6679]">
                Belajar Bahasa Isyarat
                <br />
                Lebih <span className="text-[#F86650]">Inklusif</span> & Seru
              </h2>

              {/* 4. Deskripsi */}
              <p className="mt-5 max-w-[650px] text-center text-[16px] leading-relaxed text-[#475569]">
                Jembatan komunikasi tanpa hambatan. Kuasai kosakata
                isyarat sehari-hari dengan latihan AI interaktif.
              </p>

          {/* Fitur unggulan */}
          </section>
          <section className="w-full max-w-[402px]">

            {/* Judul dan indikator */}
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[13px] font-bold tracking-wide text-[#94A3B8]">
                FITUR UNGGULAN
              </h2>

              <div className="flex gap-1">
                {fitur.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActive(index)}
                    aria-label={`Lihat fitur ${index + 1}`}
                    aria-pressed={active === index}
                    className={`h-[9px] w-[9px] rounded-full ${
                      active === index ? "bg-[#F66750]" : "bg-[#CBD5E1]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Card */}
            <div className="rounded-[28px] border border-[#EDF1F5] bg-white p-6 shadow-sm">

              {/* Ikon fitur */}
              <div className="mb-3 flex h-[48px] w-[48px] items-center justify-center rounded-[18px] bg-[#FFF0ED]">
                <Image
                  src={item.icon}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </div>

              {/* Judul fitur */}
              <h3 className="mb-3 text-[16px] font-bold leading-tight text-[#5D6679]">
                {item.judul}
              </h3>

              {/* Deskripsi */}
              <p className="min-h-[96px] text-[14px] leading-6 text-[#7184A3]">
                {item.deskripsi}
              </p>

              {/* Navigasi */}
              <div className="mt-4 flex items-center justify-between border-t border-[#F1F5F9] pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setActive((active - 1 + fitur.length) % fitur.length)
                  }
                  className="text-[13px] font-semibold text-[#94A3B8]"
                >
                  ‹ Sebelum
                </button>

                <span className="text-[12px] text-[#94A3B8]">
                  {active + 1} / {fitur.length}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setActive((active + 1) % fitur.length)
                  }
                  className="text-[13px] font-bold text-[#F66750]"
                >
                  Lanjut ❯
                </button>
              </div>

            </div>
          </section>

          {/* Tombol mulai belajar */}
          <section className="flex w-full max-w-[362px] flex-col gap-4">

            {/* Tombol utama */}
            <a
              href="/login"
              type="button"
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[20px] bg-[#F86650] text-[16px] font-bold text-white transition-colors hover:bg-[#F05440]"
            >
              Mulai Belajar Sekarang
              <span className="text-[24px] leading-none">→</span>
            </a>
          </section>

        </main>

        {/* Footer */}
        <Footer />

    </>
    );
  }