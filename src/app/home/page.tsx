import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Check,
  Flame,
  Hand,
  Lock,
  MessageSquare,
  Target,
  Trophy,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const GRADIENT_ORANGE =
  "linear-gradient(117.21deg, #FA8C3F 33.02%, #FF3030 109.3%)";
const GRADIENT_YELLOW =
  "linear-gradient(151.06deg, #F8E898 -14.82%, #FFD951 128.12%)";
const GRADIENT_BRAND = "linear-gradient(135deg, #F66750 0%, #F97316 100%)";

type DayStatus = "done" | "today" | "upcoming";

const week: { label: string; status: DayStatus; number?: number }[] = [
  { label: "Sen", status: "done" },
  { label: "Sel", status: "done" },
  { label: "Rab", status: "done" },
  { label: "Kam", status: "done" },
  { label: "Jum", status: "done" },
  { label: "Sab", status: "today" },
  { label: "Min", status: "upcoming", number: 7 },
];

const leaderboard = [
  {
    rank: 1,
    name: "Siti Rahma",
    avatar: "/avatar2.svg",
    streak: 12,
    points: "2,450",
    isMe: false,
  },
  {
    rank: 2,
    name: "You",
    avatar: "/avatar1.svg",
    streak: 7,
    points: "1,250",
    isMe: true,
  },
  {
    rank: 3,
    name: "Andi Wijaya",
    avatar: "/avatar3.svg",
    streak: 5,
    points: "980",
    isMe: false,
  },
];

const ProgressBar = ({
  value,
  gradient,
  label,
}: {
  value: number;
  gradient: string;
  label: string;
}) => (
  <div
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label={label}
    className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"
  >
    <div
      className="h-full rounded-full"
      style={{ width: `${value}%`, background: gradient }}
    />
  </div>
);

const SectionTitle = ({
  title,
  action,
  actionClassName = "text-[#F66750]",
  href,
}: {
  title: string;
  action: string;
  actionClassName?: string;
  href?: string;
}) => (
  <div className="flex items-center justify-between px-1">
    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
      {title}
    </h2>
    {href ? (
      <Link href={href} className={`text-xs font-semibold ${actionClassName}`}>
        {action}
      </Link>
    ) : (
      <span className={`text-xs font-semibold ${actionClassName}`}>
        {action}
      </span>
    )}
  </div>
);

const Home = () => {
  return (
    <>
      <Navbar />

      <main className="flex flex-1 flex-col items-center bg-[#F8FAFC] px-4 py-5 md:py-8">
        <div className="flex w-full max-w-md flex-col gap-6 md:max-w-2xl">
          {/* ===== Kartu profil ===== */}
          <section className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm md:p-5">
            {/* Header profil */}
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0">
                <Image
                  src="/avatar1.svg"
                  alt="Foto profil"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-2xl border-2 border-orange-300 object-cover"
                />
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-white bg-yellow-400 px-1.5 py-px text-[10px] font-bold text-slate-800">
                  Lvl 5
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-slate-800">Halo, You!</h1>
                <p className="truncate text-xs text-slate-500">
                  Pengembang Isyarat •
                </p>
              </div>

              <button
                type="button"
                aria-label="Notifikasi, ada pemberitahuan baru"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              >
                <Bell size={20} />
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
              </button>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="flex items-center gap-3 rounded-2xl p-3 text-white ring-2 ring-[#FFBC6A]"
                style={{ background: GRADIENT_ORANGE }}
              >
                <Image
                  src="/streak.svg"
                  alt=""
                  aria-hidden="true"
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 bg-amber-400 p-1 rounded-xl"
                  style={{ background: GRADIENT_YELLOW }}
                />
                <div>
                  <p className="text-lg font-bold leading-tight">7 Hari</p>
                  <p className="text-[8px]  text-white/90">
                    Streak Belajar
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-3 rounded-2xl  p-3 text-slate-800 ring-2 ring-[#FFBC6A]"
                style={{ background: GRADIENT_YELLOW }}
              >
                <Image
                  src="/piala.svg"
                  alt=""
                  aria-hidden="true"
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 bg-amber-400 p-1 rounded-xl"
                  style={{ background: GRADIENT_ORANGE }}
                />
                <div>
                  <p className="text-lg font-bold leading-tight">1,256</p>
                  <p className="text-[8px] font-medium text-slate-700">
                    Kumpulan Poin
                  </p>
                </div>
              </div>
            </div>

            {/* Aktivitas minggu ini */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  Aktivitas Minggu Ini
                </h3>
                <span className="text-xs font-semibold text-[#F66750]">
                  Aktif Setiap Hari!
                </span>
              </div>

              <ul className="grid grid-cols-7 gap-1">
                {week.map((day) => (
                  <li
                    key={day.label}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <span className="text-[11px] text-slate-400">
                      {day.label}
                    </span>
                    {day.status === "done" && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F66750] text-white">
                        <Check size={16} strokeWidth={3} />
                        <span className="sr-only">Selesai</span>
                      </span>
                    )}
                    {day.status === "today" && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-[#F66750] ring-2 ring-blue-400">
                        <Flame size={16} fill="currentColor" />
                        <span className="sr-only">Hari ini</span>
                      </span>
                    )}
                    {day.status === "upcoming" && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-400">
                        {day.number}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Target hari ini */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold text-slate-700">
                  <Target size={16} className="text-[#F66750]" />
                  Target Hari Ini
                </span>
                <span className="text-xs font-bold text-[#F66750]">
                  15 / 20 Menit
                </span>
              </div>
              <div className="flex">
                <ProgressBar
                  value={75}
                  gradient="linear-gradient(90deg, #F66750 0%, #FACC15 100%)"
                  label="Target belajar hari ini"
                />
              </div>
            </div>
          </section>

          {/* ===== Tantangan harian ===== */}
          <section className="flex flex-col gap-3">
            <SectionTitle
              title="Tantangan Harian"
              action="Reset dalam 4j 20m"
            />

            <div className="flex flex-col gap-3 rounded-3xl bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-[#F66750]">
                  <Hand size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    Latih 3 Kosakata Baru
                  </p>
                  <p className="text-xs text-slate-500">
                    +50 Poin • Selesai 2/3
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-xl bg-[#F66750] px-4 py-2 text-xs font-bold text-white transition hover:brightness-105"
                >
                  Klaim
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                  <Trophy size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    Selesaikan 1 Kuis Isyarat
                  </p>
                  <p className="text-xs text-slate-500">
                    +100 Poin • Belum Selesai
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-300"
                >
                  Mulai
                </button>
              </div>
            </div>
          </section>

          {/* ===== Modul belajar utama ===== */}
          <section className="flex flex-col gap-3">
            <SectionTitle
              title="Modul Belajar Utama"
              action="Lihat Semua"
              href="/modul"
            />

            {/* Modul aktif */}
            <article className="relative overflow-hidden rounded-3xl border border-red-200 bg-white p-4 shadow-sm">
              <span className="absolute right-0 top-0 rounded-bl-2xl bg-[#F66750] px-3 py-1 text-[11px] font-bold text-white">
                Sedang Dipelajari
              </span>
              <div className="flex items-center gap-4 pt-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-2xl font-extrabold text-[#F66750]">
                  A
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-800">
                    Abjad Isyarat A-Z
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dasar ejaan jari BISINDO
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <ProgressBar
                      value={80}
                      gradient="#F66750"
                      label="Progres Abjad Isyarat"
                    />
                    <span className="text-xs font-bold text-[#F66750]">
                      80%
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* Modul kedua */}
            <article className="rounded-3xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-500">
                  <MessageSquare size={26} fill="currentColor" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-800">
                    Kata Sehari-hari
                  </h3>
                  <p className="text-xs text-slate-500">
                    Salam, terima kasih, & bantuan
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <ProgressBar
                      value={35}
                      gradient="#F59E0B"
                      label="Progres Kata Sehari-hari"
                    />
                    <span className="text-xs font-bold text-amber-500">
                      35%
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* Modul terkunci */}
            <article
              aria-disabled="true"
              className="rounded-3xl border border-slate-200 bg-slate-100/70 p-4 opacity-80"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
                  <Lock size={24} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-500">
                    Angka & Waktu
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selesaikan Modul Kata Sehari-hari
                  </p>
                </div>
              </div>
            </article>
          </section>

          {/* ===== Papan peringkat ===== */}
          <section className="flex flex-col gap-3">
            <SectionTitle
              title="Papan Peringkat Minggu Ini"
              action="Liga Emas"
              actionClassName="text-amber-500"
            />

            <ol className="flex flex-col gap-3 rounded-3xl bg-white p-3 shadow-sm">
              {leaderboard.map((user) => (
                <li
                  key={user.rank}
                  className={`flex items-center gap-3 rounded-2xl border p-3 ${
                    user.isMe
                      ? "border-red-200 bg-red-50"
                      : user.rank === 1
                        ? "border-yellow-100 bg-yellow-50"
                        : "border-transparent bg-white"
                  }`}
                >
                  <span
                    className={`w-5 text-center text-base font-bold ${
                      user.rank === 1
                        ? "text-amber-500"
                        : user.isMe
                          ? "text-[#F66750]"
                          : "text-slate-400"
                    }`}
                  >
                    {user.rank}
                  </span>

                  <Image
                    src={user.avatar}
                    alt={`Avatar ${user.name}`}
                    width={40}
                    height={40}
                    className={`h-10 w-10 shrink-0 rounded-full object-cover ${
                      user.isMe ? "ring-2 ring-[#F66750]" : ""
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <span className="truncate">{user.name}</span>
                      {user.isMe && (
                        <span className="rounded-full bg-[#F66750] px-2 py-px text-[10px] font-bold text-white">
                          Kamu
                        </span>
                      )}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <Flame size={12} className="text-[#F66750]" />
                      {user.streak} Hari Streak
                    </p>
                  </div>

                  <span
                    className={`shrink-0 text-sm font-bold ${
                      user.rank === 1 || user.isMe
                        ? "text-[#F66750]"
                        : "text-slate-600"
                    }`}
                  >
                    {user.points} Poin
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Home;