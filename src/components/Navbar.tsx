'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Accessibility, ChevronDown, Contrast } from "lucide-react";

const Navbar = () => {
  const [lang, setLang] = useState("ID");
  const [highContrast, setHighContrast] = useState(false);

  const toggleContrast = () => {
    setHighContrast((prev) => !prev);
    document.documentElement.classList.toggle("high-contrast");
  };

  return (
    <header className="w-full bg-white">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row-reverse md:items-center md:justify-between md:px-8 md:py-5"
      >
        <div className="flex items-center justify-between md:justify-end md:gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-[#F66750] transition hover:bg-red-100 md:order-first md:mr-2"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full  ">
                        <Image
            src="/aksesibelitas.svg"
            alt="Logo Bisara"
            width={64}
            height={64}
            priority
            className="h-10 w-10 rounded-2xl md:h-14 md:w-14"
          />
            </span>
            Aksesibelitas
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLang(lang === "ID" ? "EN" : "ID")}
              aria-label="Ganti bahasa"
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              {lang}
              <ChevronDown size={14} />
            </button>

            <button
              type="button"
              onClick={toggleContrast}
              aria-label="Ubah kontras"
              aria-pressed={highContrast}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
            >
              <Contrast size={20} />
            </button>
          </div>
        </div>

        <Link href="/" className="flex items-center gap-3" aria-label="Bisara - Beranda">
        <div className="flex  items-center justify-center rounded-2xl bg-[linear-gradient(45deg,#F66750_0%,#FB923C_100%)] p-2">

          <Image
            src="/logo.svg"
            alt="Logo Bisara"
            width={64}
            height={64}
            priority
            className="h-10 w-10 rounded-2xl md:h-14 md:w-14"
          />
        </div>
          <div className="flex flex-col gap-1">
            <Image
              src="/bisara.svg"
              alt="Bisara"
              width={96}
              height={28}
              priority
              className="h-6 md:h-7"
            />
            <p className="text-xs text-slate-500 md:text-sm">
              Bahasa Isyarat Untuk Semua
            </p>
          </div>
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;