'use client';

import { useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Bell,
  Camera,
  CheckCircle2,
  Flame,
  Hand,
  Lock,
  LogOut,
  MessagesSquare,
  Moon,
  ScanFace,
  Settings,
  Star,
  Type,
  Users,
  type LucideIcon,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import BarMenu from "@/components/BarMenu";

const GRADIENT_BRAND = "linear-gradient(135deg, #F66750 0%, #F97316 100%)";
const GRADIENT_ORANGE =
  "linear-gradient(117.21deg, #FA8C3F 33.02%, #FF3030 109.3%)";
const GRADIENT_YELLOW =
  "linear-gradient(151.06deg, #F8E898 -14.82%, #FFD951 128.12%)";

const stats: {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClass: string;
}[] = [
  { label: "Streak Belajar", value: "7 Hari", icon: Flame, iconClass: "bg-red-50 text-[#F66750]" },
  { label: "Total Poin", value: "1,250 XP", icon: Star, iconClass: "bg-yellow-50 text-amber-500" },
  { label: "Isyarat Dikuasai", value: "48 Kata", icon: Hand, iconClass: "bg-emerald-50 text-emerald-500" },
  { label: "Diskusi Diskusi", value: "12 Post", icon: MessagesSquare, iconClass: "bg-sky-50 text-sky-500" },
];

const badges: {
  label: string;
  icon: LucideIcon;
  bg: string;
  locked?: boolean;
}[] = [
  { label: "Master Abjad", icon: CheckCircle2, bg: "bg-[#F66750]" },
  { label: "Api Konsisten", icon: Flame, bg: "bg-amber-500" },
  { label: "Teman Inklusif", icon: Users, bg: "bg-sky-500" },
  { label: "AI Deteksi", icon: ScanFace, bg: "bg-slate-200", locked: true },
];

const history = [
  {
    code: "AZ",
    title: "Modul Abjad BISINDO A-Z",
    meta: "Kemarin • 15 Kosakata",
    xp: "+50 XP",
    codeClass: "bg-red-100 text-[#F66750]",
  },
  {
    code: "S",
    title: "Sapaan & Salam Sehari-hari",
    meta: "3 hari lalu • 8 Isyarat",
    xp: "+30 XP",
    codeClass: "bg-yellow-100 text-amber-600",
  },
];

const Toggle = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
      checked ? "bg-[#F66750]" : "bg-slate-200"
    }`}
  >
    <span
      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
        checked ? "left-[22px]" : "left-0.5"
      }`}
    />
  </button>
);

const ProfilePage = () => {
  const [tab, setTab] = useState<"riwayat" | "tersimpan">("riwayat");
  const [dyslexia, setDyslexia] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [reminder, setReminder] = useState(true);

  const handleContrast = () => {
    setContrast((prev) => !prev);
    document.documentElement.classList.toggle("high-contrast");
  };

  const settings = [
    {
      icon: Type,
      iconClass: "bg-violet-50 text-violet-600",
      title: "Font Ramah Disleksia",
      desc: "Gunakan font Lexend berjarak tinggi",
      checked: dyslexia,
      onChange: () => setDyslexia((prev) => !prev),
    },
    {
      icon: Moon,
      iconClass: "bg-slate-800 text-white",
      title: "Mode Kontras Tinggi",
      desc: "Perjelas batas visual elemen UI",
      checked: contrast,
      onChange: handleContrast,
    },
    {
      icon: Bell,
      iconClass: "bg-red-50 text-[#F66750]",
      title: "Pengingat Latihan Harian",
      desc: "Notifikasi setiap jam 19:00 WIB",
      checked: reminder,
      onChange: () => setReminder((prev) => !prev),
    },
  ];

  return (
    <>
      <Navbar />

      <main className="flex flex-1 flex-col items-center mb-16 bg-[#F8FAFC] px-4 py-5 md:py-8">
        <div className="flex w-full max-w-md flex-col gap-4 md:max-w-2xl">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#F66750]">
              Ruang Inklusif
            </span>
            <button
              type="button"
              aria-label="Pengaturan"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md shadow-orange-500/25 transition hover:brightness-105"
              style={{ background: GRADIENT_BRAND }}
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Kartu profil */}
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
              className="pointer-events-none absolute -bottom-4 -right-3 h-28 w-28 opacity-80 md:h-36 md:w-36"
            />

            <div className="relative flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 md:h-24 md:w-24">
                <Image
                  src="/avatar1.svg"
                  alt="Foto profil"
                  width={96}
                  height={96}
                  className="h-full w-full rounded-4xl border-2 border-white/60 bg-white/20 object-cover"
                />
                <button
                  type="button"
                  aria-label="Ganti foto profil"
                  className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-700 shadow"
                >
                  <Camera size={14} />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="flex items-center gap-1.5 text-xl font-bold md:text-2xl">
                  You
                  <BadgeCheck
                    size={18}
                    className="text-yellow-300"
                    aria-label="Terverifikasi"
                  />
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] md:text-xs">
                  <span className="rounded-full bg-white/25 px-2.5 py-0.5 font-semibold">
                    Pembelajar Inklusif
                  </span>
                  <span className="flex items-center gap-1.5 text-white/90">
                    <span className="h-1 w-1 rounded-full bg-white/80" />
                    Yogyakarta
                  </span>
                </div>
                <p className="mt-2 text-xs italic leading-relaxed text-white/90 md:text-sm">
                  &quot;Belajar BISINDO untuk komunikasi tanpa batas.&quot;
                </p>
              </div>
            </div>
          </section>

          {/* Level / XP */}
          <section
            className="rounded-2xl p-4 text-white shadow-md shadow-red-500/15 bg-gradient-to-r from-[#FF6B53] to-[#FF4E32]"
          >
            <div className="flex items-center justify-between text-xs font-semibold md:text-sm">
              <span>Level 4: Pejuang Isyarat</span>
              <span className="text-white/90">750 / 1000 XP</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={75}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progres level"
              className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-black/20"
            >
              <div className="h-full w-3/4 rounded-full bg-white" />
            </div>
            <p className="mt-2 text-right text-[10px] text-white/85 md:text-xs">
              Butuh 250 XP lagi untuk Level 5 (Master BISINDO)
            </p>
          </section>

          {/* Statistik */}
          <section className="grid grid-cols-2 gap-3">
            {stats.map(({ label, value, icon: Icon, iconClass }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                >
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] text-slate-500">{label}</p>
                  <p className="text-base font-bold text-slate-900">{value}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Lencana */}
          <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Lencana Pencapaian
                </h2>
                <p className="text-xs text-slate-500">
                  Koleksi apresiasi atas konsistensi belajar Anda
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-[#F66750]">
                3 / 4 Terbuka
              </span>
            </div>

            <ul className="mt-4 grid grid-cols-4 gap-2.5">
              {badges.map(({ label, icon: Icon, bg, locked }) => (
                <li
                  key={label}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border border-slate-100 px-1 py-3 ${
                    locked ? "bg-slate-50" : "bg-white shadow-sm"
                  }`}
                >
                  {locked && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 text-white">
                      <Lock size={9} />
                      <span className="sr-only">Terkunci</span>
                    </span>
                  )}
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${
                      locked ? "text-slate-400" : "text-white"
                    }`}
                  >
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span
                    className={`text-center text-[10px] font-semibold leading-tight md:text-xs ${
                      locked ? "text-slate-400" : "text-slate-700"
                    }`}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Riwayat / Tersimpan */}
          <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
            <div
              role="tablist"
              aria-label="Riwayat dan tersimpan"
              className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1"
            >
              {[
                { id: "riwayat", label: "Riwayat Latihan" },
                { id: "tersimpan", label: "Tersimpan" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id as "riwayat" | "tersimpan")}
                  className={`rounded-lg py-2 text-xs font-semibold transition md:text-sm ${
                    tab === t.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "riwayat" ? (
              <ul className="mt-4 flex flex-col gap-3">
                {history.map((item) => (
                  <li
                    key={item.title}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${item.codeClass}`}
                    >
                      {item.code}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500">{item.meta}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-600">
                      {item.xp}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                Belum ada isyarat tersimpan.
              </p>
            )}
          </section>

          {/* Aksesibilitas & pengaturan */}
          <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
            <h2 className="text-base font-bold text-slate-900">
              Aksesibilitas &amp; Pengaturan
            </h2>
            <p className="text-xs text-slate-500">
              Sesuaikan tampilan agar nyaman bagi kebutuhan Anda
            </p>

            <ul className="mt-4 flex flex-col gap-4">
              {settings.map(
                ({ icon: Icon, iconClass, title, desc, checked, onChange }) => (
                  <li key={title} className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {title}
                      </p>
                      <p className="text-[11px] text-slate-500">{desc}</p>
                    </div>
                    <Toggle checked={checked} onChange={onChange} label={title} />
                  </li>
                )
              )}
            </ul>

            <button
              type="button"
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-[#F66750] transition hover:bg-red-100"
            >
              <LogOut size={18} />
              Keluar dari Akun
            </button>
          </section>
        </div>
      </main>

        <BarMenu />
    </>
  );
};

export default ProfilePage;