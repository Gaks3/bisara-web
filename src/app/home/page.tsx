"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Hand,
  Loader2,
  MessageSquare,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BarMenu from "@/components/BarMenu";
import {
  apiService,
  DashboardData,
  FALLBACK_DASHBOARD,
  FALLBACK_LEADERBOARD,
  LeaderboardData,
} from "@/lib/api-service";

const GRADIENT_ORANGE =
  "linear-gradient(117.21deg, #FA8C3F 33.02%, #FF3030 109.3%)";
const GRADIENT_YELLOW =
  "linear-gradient(151.06deg, #F8E898 -14.82%, #FFD951 128.12%)";
const GRADIENT_BRAND = "linear-gradient(135deg, #F66750 0%, #F97316 100%)";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// Jumlah entri yang tampil sebelum menekan "Lihat Semua"
const LEADERBOARD_PREVIEW_COUNT = 3;

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
      className="h-full rounded-full transition-all duration-500"
      style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: gradient }}
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
  action?: string;
  actionClassName?: string;
  href?: string;
}) => (
  <div className="flex items-center justify-between px-1">
    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
      {title}
    </h2>
    {action &&
      (href ? (
        <Link href={href} className={`text-xs font-semibold ${actionClassName}`}>
          {action}
        </Link>
      ) : (
        <span className={`text-xs font-semibold ${actionClassName}`}>
          {action}
        </span>
      ))}
  </div>
);

const HomeSkeleton = () => (
  <div className="flex w-full flex-col gap-6 animate-pulse">
    {/* Profile Card Skeleton */}
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-xs border border-slate-100">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-slate-200 shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-5 w-36 rounded bg-slate-200" />
          <div className="h-3.5 w-48 rounded bg-slate-200" />
        </div>
        <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded-2xl bg-slate-200/80" />
        <div className="h-20 rounded-2xl bg-slate-200/80" />
      </div>
      <div className="h-24 rounded-2xl bg-slate-200/60" />
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-200" />
      </div>
    </div>

    {/* Daily Challenge Skeleton */}
    <div className="flex flex-col gap-3">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 border border-slate-100">
        <div className="h-16 rounded-2xl bg-slate-200/70" />
        <div className="h-16 rounded-2xl bg-slate-200/70" />
      </div>
    </div>

    {/* Modules Skeleton */}
    <div className="flex flex-col gap-3">
      <div className="h-4 w-36 rounded bg-slate-200" />
      <div className="h-28 rounded-3xl bg-slate-200/80" />
    </div>

    {/* Leaderboard Skeleton */}
    <div className="flex flex-col gap-3">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="flex flex-col gap-2 rounded-3xl bg-white p-4 border border-slate-100">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-2xl bg-slate-200/60" />
        ))}
      </div>
    </div>
  </div>
);

const Home = () => {
  const [dashboard, setDashboard] = useState<DashboardData>(FALLBACK_DASHBOARD);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>(FALLBACK_LEADERBOARD);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<
    "DAILY" | "WEEKLY" | "MONTHLY" | "ALL_TIME"
  >("WEEKLY");
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimedNotice, setClaimedNotice] = useState(false);
  const [, startTransition] = useTransition();

  // Load dashboard data and leaderboard on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [dashData, lbData] = await Promise.all([
          apiService.getDashboard(),
          apiService.getLeaderboard(leaderboardPeriod, 10),
        ]);
        if (isMounted) {
          if (dashData) setDashboard(dashData);
          if (lbData) setLeaderboard(lbData);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [leaderboardPeriod]);

  // Handle Leaderboard Period Switch
  const handlePeriodChange = (period: "DAILY" | "WEEKLY" | "MONTHLY" | "ALL_TIME") => {
    setLeaderboardPeriod(period);
    setShowAllLeaderboard(false); // kembali ke tampilan ringkas saat ganti periode
    startTransition(async () => {
      try {
        const data = await apiService.getLeaderboard(period, 10);
        if (data) setLeaderboard(data);
      } catch (err) {
        console.error("Failed to update leaderboard period:", err);
      }
    });
  };

  // Handle Claim streak activity (+15 min)
  const handleClaimActivity = async () => {
    if (claiming || claimedNotice) return;
    setClaiming(true);
    try {
      const streakRes = await apiService.recordStreakActivity(15);
      setDashboard((prev) => ({
        ...prev,
        score: prev.score + 50,
        streak: {
          ...prev.streak,
          currentDays: streakRes.currentDays,
          longestDays: streakRes.longestDays,
          lastActivityDate: streakRes.lastActivityDate,
        },
        dailyTarget: {
          ...prev.dailyTarget,
          completedMinutes: Math.min(
            prev.dailyTarget.targetMinutes,
            prev.dailyTarget.completedMinutes + 5
          ),
        },
      }));
      setClaimedNotice(true);
      setTimeout(() => setClaimedNotice(false), 3500);
    } catch (err) {
      console.error("Error recording streak activity:", err);
    } finally {
      setClaiming(false);
    }
  };

  // Compute weekly activity days
  const todayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon, etc.
  const weekDays = [1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
    const isToday = dayIdx === todayIndex;
    const isPast =
      todayIndex === 0
        ? dayIdx !== 0
        : dayIdx < todayIndex && dayIdx !== 0;

    return {
      label: DAY_LABELS[dayIdx],
      isToday,
      isDone: isPast || (isToday && dashboard.dailyTarget.completedMinutes > 0),
    };
  });

  const targetPercent = Math.min(
    100,
    Math.round(
      (dashboard.dailyTarget.completedMinutes /
        Math.max(1, dashboard.dailyTarget.targetMinutes)) *
        100
    )
  );

  // Data leaderboard yang ditampilkan
  const allEntries = leaderboard.entries ?? [];
  const visibleEntries = showAllLeaderboard
    ? allEntries
    : allEntries.slice(0, LEADERBOARD_PREVIEW_COUNT);
  const hasMoreEntries = allEntries.length > LEADERBOARD_PREVIEW_COUNT;

  return (
    <>
      <Navbar />

      <main className="mb-20 flex flex-1 flex-col items-center bg-[#F8FAFC] px-4 py-5 md:py-8">
        <div className="flex w-full max-w-md flex-col gap-6 md:max-w-2xl">
          {loading ? (
            <HomeSkeleton />
          ) : (
            <>
              {/* Claim alert notification */}
              {claimedNotice && (
                <div
                  role="alert"
                  className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 shadow-sm"
                >
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <span>Aktivitas harian tercatat! +50 XP ditambahkan ke profil Anda.</span>
                </div>
              )}

              {/* ===== Kartu profil ===== */}
              <section className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm md:p-5">
                {/* Header profil */}
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0">
                    <Image
                      src={dashboard.user?.image || "/avatar1.svg"}
                      alt={dashboard.user?.name || "Foto Profil"}
                      width={56}
                      height={56}
                      unoptimized={!!dashboard.user?.image?.startsWith("http")}
                      className="h-14 w-14 rounded-2xl border-2 border-orange-300 object-cover"
                    />
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-white bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-slate-800">
                      Lvl {Math.max(1, Math.floor(dashboard.score / 250))}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg font-bold text-slate-800">
                      Halo, {dashboard.user?.name || "Teman Bisara"}!
                    </h1>
                    <p className="truncate text-xs text-slate-500">
                      {dashboard.user?.roleTitle || "Pembelajar Inklusif"} •{" "}
                      {dashboard.user?.city || "Indonesia"}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Notifikasi"
                    className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                  >
                    <Bell size={20} />
                    <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
                  </button>
                </div>

                {/* Statistik (Streak & Poin) */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="flex items-center gap-3 rounded-2xl p-3 text-white ring-2 ring-[#FFBC6A]"
                    style={{ background: GRADIENT_ORANGE }}
                  >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl p-1"
                  style={{ background: GRADIENT_YELLOW }}
                >
                  <Image
                    src="/streak.svg"
                    alt="Streak"
                    width={22}
                    height={22}
                    className="object-contain"
                  />
                </div>
                    <div>
                      <p className="text-[15px] font-bold leading-tight">
                        {dashboard.streak?.currentDays || 0} Hari
                      </p>
                      <p className="text-[10px] text-white/90">Streak Belajar</p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 rounded-2xl p-3 text-slate-800 ring-2 ring-[#FFBC6A]"
                    style={{ background: GRADIENT_YELLOW }}
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl p-1"
                      style={{ background: GRADIENT_ORANGE }}
                    >
                      <Trophy size={26} className="text-amber-100" />
                    </div>
                    <div>
                      <p className="text-lg font-bold leading-tight">
                        {dashboard.score?.toLocaleString() || 0}
                      </p>
                      <p className="text-[10px] font-medium text-slate-700">
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
                      {dashboard.streak?.currentDays || 0} Hari Konsisten!
                    </span>
                  </div>

                  <ul className="grid grid-cols-7 gap-1">
                    {weekDays.map((day) => (
                      <li
                        key={day.label}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <span className="text-[11px] text-slate-400">
                          {day.label}
                        </span>
                        {day.isDone && !day.isToday && (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F66750] text-white">
                            <Check size={16} strokeWidth={3} />
                            <span className="sr-only">Selesai</span>
                          </span>
                        )}
                        {day.isToday && (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-[#F66750] ring-2 ring-orange-400">
                              <Image
    src="/streak.svg"
    alt="Streak"
    width={16}
    height={16}
    className="object-contain"
  />
                            <span className="sr-only">Hari ini</span>
                          </span>
                        )}
                        {!day.isDone && !day.isToday && (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-400">
                            -
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
                      {dashboard.dailyTarget?.completedMinutes || 0} /{" "}
                      {dashboard.dailyTarget?.targetMinutes || 20} Menit
                    </span>
                  </div>
                  <div className="flex">
                    <ProgressBar
                      value={targetPercent}
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
                  action="Reset dalam 24 Jam"
                />

                <div className="flex flex-col gap-3 rounded-3xl bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-[#F66750]">
                      <Hand size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        Latih {dashboard.masteredSignsCount || 3} Kosakata Baru
                      </p>
                      <p className="text-xs text-slate-500">
                        +50 XP • Dikuasai {dashboard.masteredSignsCount || 0} Isyarat
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClaimActivity}
                      disabled={claiming}
                      className="shrink-0 rounded-xl bg-[#F66750] px-4 py-2 text-xs font-bold text-white transition hover:brightness-105 active:scale-95 disabled:opacity-60"
                    >
                      {claiming ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Klaim"
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                      <Trophy size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        Selesaikan Latihan Kamera AI
                      </p>
                      <p className="text-xs text-slate-500">
                        +100 Poin • Buka Modul Belajar
                      </p>
                    </div>
                    <Link
                      href="/belajar"
                      className="shrink-0 rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-300"
                    >
                      Mulai
                    </Link>
                  </div>
                </div>
              </section>

              {/* ===== Modul belajar utama ===== */}
              <section className="flex flex-col gap-3">
                <SectionTitle
                  title="Modul Belajar Utama"
                  action="Buka Katalog"
                  href="/belajar"
                />

                {dashboard.progress && dashboard.progress.length > 0 ? (
                  dashboard.progress.map((prog, idx) => (
                    <article
                      key={prog.levelCode || idx}
                      className={`relative overflow-hidden rounded-3xl border bg-white p-4 shadow-sm ${
                        idx === 0 ? "border-red-200" : "border-slate-100"
                      }`}
                    >
                      {idx === 0 && (
                        <span className="absolute right-0 top-0 rounded-bl-2xl bg-[#F66750] px-3 py-1 text-[11px] font-bold text-white">
                          Sedang Dipelajari
                        </span>
                      )}
                      <div className="flex items-center gap-4 pt-2">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-2xl font-extrabold text-[#F66750]">
                          {prog.levelCode ? `L${prog.levelCode}` : "A"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold text-slate-800">
                            {prog.title}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Poin diraih: {prog.score} XP
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <ProgressBar
                              value={prog.progressPercent}
                              gradient="#F66750"
                              label={`Progres ${prog.title}`}
                            />
                            <span className="text-xs font-bold text-[#F66750]">
                              {prog.progressPercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <article className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-4">
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
                )}

                {/* Link ke Pusat Belajar */}
                <Link
                  href="/belajar"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate bg-orange-50/50 py-3 text-xs font-bold text-[#F66750] transition hover:bg-orange-50"
                >
                  Jelajahi Modul di Pusat Belajar
                </Link>
              </section>

              {/* ===== Papan peringkat (Leaderboard) ===== */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Papan Peringkat
                  </h2>

                  {/* Period selector */}
                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-0.5 text-[11px] font-semibold text-slate-600">
                    {(["WEEKLY", "DAILY", "ALL_TIME"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePeriodChange(p)}
                        className={`rounded-lg px-2.5 py-1 transition ${
                          leaderboardPeriod === p
                            ? "bg-white text-[#F66750] shadow-sm font-bold"
                            : "hover:text-slate-900"
                        }`}
                      >
                        {p === "WEEKLY"
                          ? "Mingguan"
                          : p === "DAILY"
                          ? "Harian"
                          : "Semua"}
                      </button>
                    ))}
                  </div>
                </div>

                <ol className="flex flex-col gap-2 rounded-3xl bg-white p-3 shadow-sm">
                  {visibleEntries.length > 0 ? (
                    visibleEntries.map((entry) => {
                      const isMe =
                        entry.user?.id === dashboard.user?.id ||
                        entry.user?.name === dashboard.user?.name;

                      return (
                        <li
                          key={entry.rank + entry.user?.id}
                          className={`flex items-center gap-3 rounded-2xl p-3 transition ${
                            isMe
                              ? " bg-red-50/80"
                              : entry.rank === 1
                              ? "border-yellow-200 bg-yellow-50/70"
                              : "border-transparent bg-slate-50/50"
                          }`}
                        >
                          <span
                            className={`w-6 text-center text-sm font-extrabold ${
                              entry.rank === 1
                                ? "text-amber-500"
                                : entry.rank === 2
                                ? "text-slate-500"
                                : entry.rank === 3
                                ? "text-orange-400"
                                : "text-slate-400"
                            }`}
                          >
                            {entry.rank}
                          </span>

                          <Image
                            src={
                              entry.user?.image ||
                              (entry.rank === 1
                                ? "/avatar2.svg"
                                : isMe
                                ? "/avatar1.svg"
                                : "/avatar3.svg")
                            }
                            alt={`Avatar ${entry.user?.name}`}
                            width={40}
                            height={40}
                            unoptimized={!!entry.user?.image?.startsWith("http")}
                            className={`h-10 w-10 shrink-0 rounded-full object-cover ${
                              isMe ? "ring-2 ring-[#F66750]" : ""
                            }`}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                              <span className="truncate">{entry.user?.name}</span>
                              {isMe && (
                                <span className="rounded-full bg-[#F66750] px-2 py-px text-[10px] font-bold text-white">
                                  Kamu
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Pembelajar Aktif
                            </p>
                          </div>

                          <span
                            className={`shrink-0 text-sm font-bold ${
                              entry.rank === 1 || isMe
                                ? "text-[#F66750]"
                                : "text-slate-700"
                            }`}
                          >
                            {entry.score.toLocaleString()} Poin
                          </span>
                        </li>
                      );
                    })
                  ) : (
                    <li className="py-6 text-center text-xs text-slate-400">
                      Belum ada data peringkat untuk periode ini.
                    </li>
                  )}
                </ol>

                {/* Tombol Lihat Semua / Tampilkan Lebih Sedikit */}
                {hasMoreEntries && (
                  <button
                    type="button"
                    onClick={() => setShowAllLeaderboard((prev) => !prev)}
                    className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-[#F66750] transition hover:bg-slate-50"
                  >
                    {showAllLeaderboard ? (
                      <>
                        Tampilkan Lebih Sedikit <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        Lihat Semua ({allEntries.length}) <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <BarMenu />
    </>
  );
};

export default Home;