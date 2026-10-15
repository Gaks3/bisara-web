'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  Camera,
  CheckCircle2,
  Edit3,
  Flame,
  Hand,
  Loader2,
  Lock,
  LogOut,
  MessagesSquare,
  Moon,
  Save,
  ScanFace,
  Settings,
  Star,
  Type,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BarMenu from "@/components/BarMenu";
import {
  apiService,
  FALLBACK_PROFILE,
  ProfileData,
  UpdateProfileRequest,
} from "@/lib/api-service";

const GRADIENT_BRAND = "linear-gradient(135deg, #F66750 0%, #F97316 100%)";

const Toggle = ({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
      checked ? "bg-[#F66750]" : "bg-slate-200"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <span
      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
        checked ? "left-[22px]" : "left-0.5"
      }`}
    />
  </button>
);

const ProfileSkeleton = () => (
  <div className="flex w-full flex-col gap-4 animate-pulse">
    {/* Profile Card Skeleton */}
    <div className="h-44 w-full rounded-3xl bg-slate-200/80" />

    {/* Level XP Bar Skeleton */}
    <div className="h-24 w-full rounded-2xl bg-slate-200/70" />

    {/* 4 Stats Grid Skeleton */}
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 rounded-2xl bg-slate-200/70" />
      ))}
    </div>

    {/* Achievements Skeleton */}
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 border border-slate-100">
      <div className="h-5 w-40 rounded bg-slate-200" />
      <div className="grid grid-cols-4 gap-2.5 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-200/60" />
        ))}
      </div>
    </div>

    {/* Practice History Skeleton */}
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 border border-slate-100">
      <div className="h-10 w-full rounded-xl bg-slate-200/60" />
      <div className="h-16 w-full rounded-2xl bg-slate-200/50" />
      <div className="h-16 w-full rounded-2xl bg-slate-200/50" />
    </div>

    {/* Accessibility Settings Skeleton */}
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 border border-slate-100">
      <div className="h-5 w-48 rounded bg-slate-200" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-10 w-44 rounded bg-slate-200/70" />
          <div className="h-7 w-12 rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  </div>
);

const ProfilePage = () => {
  const router = useRouter();
  // null = belum selesai fetch; setelah fetch selesai diisi data real atau FALLBACK
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"riwayat" | "tersimpan">("riwayat");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editCity, setEditCity] = useState("");
  const [updateNotice, setUpdateNotice] = useState<string | null>(null);

  // Fetch profile on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        const data = await apiService.getProfile();
        if (isMounted && data) {
          setProfile(data);
          setEditName(data.user?.name || "");
          setEditBio(data.user?.bio || "");
          setEditCity(data.user?.city || "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        // Fallback hanya jika benar-benar error; bukan dipakai sebagai state awal
        if (isMounted) setProfile(FALLBACK_PROFILE);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Preferences Toggle (Calls PATCH /api/profile/update)
  const handleTogglePreference = async (
    key: "dailyReminder" | "dyslexiaFont" | "highContrast"
  ) => {
    if (!profile) return;
    const updatedPref = {
      ...profile.preferences,
      [key]: !profile.preferences[key],
    };

    // Apply visual effects if needed
    if (key === "highContrast") {
      document.documentElement.classList.toggle("high-contrast", updatedPref.highContrast);
    }

    setProfile((prev) => prev ? { ...prev, preferences: updatedPref } : prev);

    try {
      await apiService.updateProfile({ preferences: updatedPref });
    } catch (err) {
      console.error("Failed to update preference:", err);
    }
  };

  // Handle Profile Update Form Submission
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setUpdateNotice(null);

    const payload: UpdateProfileRequest = {
      name: editName,
      bio: editBio,
      city: editCity,
    };

    try {
      const res = await apiService.updateProfile(payload);
      if (res) {
        setProfile((prev) =>
          prev
            ? { ...prev, user: { ...prev.user, name: editName, bio: editBio, city: editCity } }
            : prev
        );
      }
      setIsEditing(false);
      setUpdateNotice("Profil berhasil diperbarui!");
      setTimeout(() => setUpdateNotice(null), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  // Handle Logout
  const handleSignOut = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      await apiService.signOut();
      router.push("/login");
    }
  };

  // Badges icon helper
  const getBadgeIcon = (iconName: string): LucideIcon => {
    switch (iconName?.toLowerCase()) {
      case "check":
      case "checkcircle2":
        return CheckCircle2;
      case "flame":
        return Flame;
      case "users":
        return Users;
      case "scan":
      case "scanface":
        return ScanFace;
      default:
        return CheckCircle2;
    }
  };

  return (
    <>
      <Navbar />

      <main className="mb-20 flex flex-1 flex-col items-center bg-[#F8FAFC] px-4 py-5 md:py-8">
        <div className="flex w-full max-w-md flex-col gap-4 md:max-w-2xl">
          {/* Skeleton saat loading ATAU data belum ada */}
          {loading || !profile ? (
            <ProfileSkeleton />
          ) : (
            <>
              {/* Top bar */}
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#F66750]">
                  Ruang Profil Inklusif
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <Edit3 size={14} className="text-[#F66750]" />
                  {isEditing ? "Tutup Edit" : "Edit Profil"}
                </button>
              </div>

          {/* Update notice */}
          {updateNotice && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800"
            >
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>{updateNotice}</span>
            </div>
          )}

          {/* Edit Profile Form Modal / Box */}
          {isEditing && (
            <section className="rounded-3xl border border-orange-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">
                  Ubah Profil (PATCH /api/profile/update)
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-4 flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-name" className="text-xs font-semibold text-slate-700">
                    Nama Lengkap
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 focus:border-[#F66750] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-city" className="text-xs font-semibold text-slate-700">
                    Kota Domisili
                  </label>
                  <input
                    id="edit-city"
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="Contoh: Yogyakarta"
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 focus:border-[#F66750] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-bio" className="text-xs font-semibold text-slate-700">
                    Bio / Status Pembelajar
                  </label>
                  <textarea
                    id="edit-bio"
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tuliskan motivasi belajar BISINDO Anda..."
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-[#F66750] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-xl bg-[#F66750] px-4 py-2 text-xs font-bold text-white transition hover:brightness-105 disabled:opacity-70"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </section>
          )}

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
                  src={profile.user?.image || "/avatar1.svg"}
                  alt={profile.user?.name || "Foto profil"}
                  width={96}
                  height={96}
                  unoptimized={!!profile.user?.image?.startsWith("http")}
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
                  {profile.user?.name || "Teman Bisara"}
                  {profile.user?.isVerified && (
                    <BadgeCheck
                      size={18}
                      className="text-yellow-300"
                      aria-label="Terverifikasi"
                    />
                  )}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] md:text-xs">
                  <span className="rounded-full bg-white/25 px-2.5 py-0.5 font-semibold">
                    {profile.user?.roleTitle || "Pembelajar Inklusif"}
                  </span>
                  <span className="flex items-center gap-1.5 text-white/90">
                    <span className="h-1 w-1 rounded-full bg-white/80" />
                    {profile.user?.city || "Indonesia"}
                  </span>
                </div>
                {profile.user?.bio && (
                  <p className="mt-2 text-xs italic leading-relaxed text-white/90 md:text-sm">
                    &quot;{profile.user.bio}&quot;
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Level / XP Progress */}
          <section className="rounded-2xl p-4 text-white shadow-md shadow-red-500/15 bg-gradient-to-r from-[#FF6B53] to-[#FF4E32]">
            <div className="flex items-center justify-between text-xs font-semibold md:text-sm">
              <span>
                Level {profile.levelProgress?.currentLevel ?? 0}:{" "}
                {profile.levelProgress?.currentLevelTitle ?? "—"}
              </span>
              <span className="text-white/90">
                {profile.levelProgress?.currentLevelXp ?? 0} /{" "}
                {profile.levelProgress?.nextLevelXp ?? 0} XP
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={profile.levelProgress?.progressPercent ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progres level"
              className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-black/20"
            >
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{
                  width: `${profile.levelProgress?.progressPercent ?? 0}%`,
                }}
              />
            </div>
            <p className="mt-2 text-right text-[10px] text-white/85 md:text-xs">
              Butuh {profile.levelProgress?.remainingXp ?? 0} XP lagi untuk{" "}
              {profile.levelProgress?.nextLevelTitle ?? "Level Berikutnya"}
            </p>
          </section>

          {/* Statistik */}
          {(() => {
            const stats = [
              {
                label: "Streak Belajar",
                value: `${profile.stats?.streakDays ?? 0} Hari`,
                icon: Flame,
                iconClass: "bg-red-50 text-[#F66750]",
              },
              {
                label: "Total Poin",
                value: `${(profile.stats?.totalXp ?? 0).toLocaleString()} XP`,
                icon: Star,
                iconClass: "bg-yellow-50 text-amber-500",
              },
              {
                label: "Isyarat Dikuasai",
                value: `${profile.stats?.masteredSignsCount ?? 0} Kata`,
                icon: Hand,
                iconClass: "bg-emerald-50 text-emerald-500",
              },
              {
                label: "Diskusi",
                value: `${profile.stats?.discussionCount ?? 0} Post`,
                icon: MessagesSquare,
                iconClass: "bg-sky-50 text-sky-500",
              },
            ];
            return (
              <section className="grid grid-cols-2 gap-3">
                {stats.map(({ label, value, icon: Icon, iconClass }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] text-slate-500">{label}</p>
                      <p className="text-base font-bold text-slate-900">{value}</p>
                    </div>
                  </div>
                ))}
              </section>
            );
          })()}

          {/* Lencana Pencapaian */}
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
                {profile.achievements?.unlockedCount || 3} /{" "}
                {profile.achievements?.totalCount || 4} Terbuka
              </span>
            </div>

            <ul className="mt-4 grid grid-cols-4 gap-2.5">
              {profile.achievements?.list?.map((ach) => {
                const Icon = getBadgeIcon(ach.icon);
                const isLocked = !ach.isUnlocked;

                return (
                  <li
                    key={ach.id}
                    title={ach.description}
                    className={`relative flex flex-col items-center gap-2 rounded-2xl border border-slate-100 px-1 py-3 transition hover:shadow-md ${
                      isLocked ? "bg-slate-50 opacity-70" : "bg-white shadow-sm"
                    }`}
                  >
                    {isLocked && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 text-white">
                        <Lock size={9} />
                        <span className="sr-only">Terkunci</span>
                      </span>
                    )}
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        isLocked
                          ? "bg-slate-200 text-slate-400"
                          : "bg-[#F66750] text-white"
                      }`}
                    >
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span
                      className={`text-center text-[10px] font-semibold leading-tight md:text-xs ${
                        isLocked ? "text-slate-400" : "text-slate-700"
                      }`}
                    >
                      {ach.name}
                    </span>
                  </li>
                );
              })}
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
                {
                  id: "tersimpan",
                  label: `Tersimpan (${profile.savedItemsCount || 0})`,
                },
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
                {profile.practiceHistory && profile.practiceHistory.length > 0 ? (
                  profile.practiceHistory.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold bg-red-100 text-[#F66750]">
                        {item.badge}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.timeAgo} • {item.itemCountText}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-600">
                        +{item.xpGained} XP
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="py-6 text-center text-xs text-slate-400">
                    Belum ada riwayat latihan.
                  </p>
                )}
              </ul>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                {profile.savedItemsCount > 0
                  ? `Ada ${profile.savedItemsCount} isyarat tersimpan di daftar Anda.`
                  : "Belum ada isyarat tersimpan."}
              </p>
            )}
          </section>

          {/* Aksesibilitas & pengaturan */}
          <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
            <h2 className="text-base font-bold text-slate-900">
              Aksesibilitas &amp; Pengaturan
            </h2>
            <p className="text-xs text-slate-500">
              Sesuaikan preferensi tampilan agar nyaman bagi kebutuhan Anda
            </p>

            <ul className="mt-4 flex flex-col gap-4">
              {[
                {
                  icon: Type,
                  iconClass: "bg-violet-50 text-violet-600",
                  title: "Font Ramah Disleksia",
                  desc: "Gunakan font dengan jarak dan bentuk lebih ramah pembaca",
                  checked: !!profile.preferences?.dyslexiaFont,
                  onChange: () => handleTogglePreference("dyslexiaFont"),
                },
                {
                  icon: Moon,
                  iconClass: "bg-slate-800 text-white",
                  title: "Mode Kontras Tinggi",
                  desc: "Perjelas batas visual elemen UI untuk aksesibilitas tinggi",
                  checked: !!profile.preferences?.highContrast,
                  onChange: () => handleTogglePreference("highContrast"),
                },
                {
                  icon: Bell,
                  iconClass: "bg-red-50 text-[#F66750]",
                  title: "Pengingat Latihan Harian",
                  desc: `Notifikasi setiap jam ${profile.preferences?.reminderTime ?? "19:00 WIB"}`,
                  checked: !!profile.preferences?.dailyReminder,
                  onChange: () => handleTogglePreference("dailyReminder"),
                },
              ].map(({ icon: Icon, iconClass, title, desc, checked, onChange }) => (
                <li key={title} className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{title}</p>
                    <p className="text-[11px] text-slate-500">{desc}</p>
                  </div>
                  <Toggle checked={checked} onChange={onChange} label={title} />
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handleSignOut}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-[#F66750] transition hover:bg-red-100 active:scale-[0.99]"
            >
              <LogOut size={18} />
              Keluar dari Akun
            </button>
          </section>
            </>
          )}
        </div>
      </main>

      <BarMenu />
    </>
  );
};

export default ProfilePage;