"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { authClient } from "@/lib/auth-client";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Kata sandi baru wajib diisi")
      .min(8, "Kata sandi minimal 8 karakter"),
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setErrorMessage("Token pemulihan tidak ditemukan.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const { data: resData, error } = await authClient.resetPassword({
        newPassword: data.newPassword,
        token,
      });

      if (error) {
        console.error("Reset password error:", error);
        setErrorMessage(
          error.message ||
            "Gagal mengatur ulang kata sandi. Pastikan tautan masih berlaku."
        );
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setLoading(false);

      // Otomatis arahkan ke halaman login setelah 1.8 detik
      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (err: unknown) {
      console.error("Reset password error:", err);
      const errObj = err as {
        message?: string;
        error?: { message?: string } | string;
        response?: {
          data?: {
            message?: string;
            error?: { message?: string } | string;
          };
        };
      };

      const rawMsg =
        errObj.response?.data?.message ||
        (typeof errObj.response?.data?.error === "string"
          ? errObj.response?.data?.error
          : typeof errObj.response?.data?.error === "object"
          ? errObj.response?.data?.error?.message
          : undefined) ||
        (typeof errObj.error === "object"
          ? errObj.error?.message
          : typeof errObj.error === "string"
          ? errObj.error
          : undefined) ||
        errObj.message;

      setErrorMessage(
        rawMsg || "Terjadi kesalahan. Silakan coba beberapa saat lagi."
      );
      setLoading(false);
    }
  };

  // Kasus 1: Error INVALID_TOKEN
  if (errorParam === "INVALID_TOKEN") {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-500">
          <AlertCircle size={32} />
        </div>
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
          Tautan Kedaluwarsa
        </span>
        <h2 className="text-xl font-bold text-slate-800 md:text-2xl">
          Tautan Tidak Valid
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Tautan untuk mengatur ulang kata sandi tidak valid atau masa berlakunya telah habis. Silakan ajukan tautan baru.
        </p>

        <div className="mt-6 flex w-full flex-col gap-3">
          <Link
            href="/forgot-password"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105"
            style={{
              background:
                "linear-gradient(135deg, #F66750 0%, #F97316 100%)",
            }}
          >
            Minta Tautan Baru
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
          >
            Kembali ke Halaman Masuk
          </Link>
        </div>
      </section>
    );
  }

  // Kasus 2: Token tidak ada dalam URL
  if (!token) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <AlertCircle size={32} />
        </div>
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          Token Tidak Ditemukan
        </span>
        <h2 className="text-xl font-bold text-slate-800 md:text-2xl">
          Tautan Tidak Lengkap
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Token reset kata sandi tidak ditemukan pada tautan ini. Pastikan Anda mengklik tautan lengkap yang dikirimkan ke email Anda.
        </p>

        <div className="mt-6 flex w-full flex-col gap-3">
          <Link
            href="/forgot-password"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105"
            style={{
              background:
                "linear-gradient(135deg, #F66750 0%, #F97316 100%)",
            }}
          >
            Ke Halaman Lupa Password
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
          >
            Kembali ke Halaman Masuk
          </Link>
        </div>
      </section>
    );
  }

  // Kasus 3: Sukses Reset Kata Sandi
  if (isSuccess) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={32} />
        </div>
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Berhasil Diperbarui
        </span>
        <h2 className="text-xl font-bold text-slate-800 md:text-2xl">
          Kata Sandi Berhasil Diubah!
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Kata sandi baru Anda telah aktif. Anda akan dialihkan secara otomatis ke halaman masuk...
        </p>

        <div className="mt-6 flex w-full flex-col gap-3">
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105"
            style={{
              background:
                "linear-gradient(135deg, #F66750 0%, #F97316 100%)",
            }}
          >
            <LogIn size={16} />
            Masuk Sekarang
          </Link>
        </div>
      </section>
    );
  }

  // Tampilan Form Utama
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm md:p-6">
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
        >
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        {/* Kata Sandi Baru */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="newPassword"
            className="text-sm font-semibold text-slate-700"
          >
            Kata Sandi Baru
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              {...register("newPassword")}
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-12 text-sm text-slate-700 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
                errors.newPassword
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:border-[#F66750] focus:ring-[#F66750]/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errors.newPassword.message}</span>
            </p>
          )}
        </div>

        {/* Konfirmasi Kata Sandi Baru */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-semibold text-slate-700"
          >
            Konfirmasi Kata Sandi Baru
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              autoComplete="new-password"
              placeholder="Ulangi kata sandi baru"
              className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-12 text-sm text-slate-700 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:border-[#F66750] focus:ring-[#F66750]/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={
                showConfirmPassword
                  ? "Sembunyikan kata sandi"
                  : "Tampilkan kata sandi"
              }
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errors.confirmPassword.message}</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105 active:scale-[0.99] disabled:cursor-wait disabled:opacity-75"
          style={{
            background:
              "linear-gradient(135deg, #F66750 0%, #F97316 100%)",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Menyimpan Kata Sandi...
            </>
          ) : (
            <>
              Simpan Kata Sandi Baru
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />

      <main className="flex flex-1 flex-col items-center bg-[#F8FAFC] px-4 py-6 md:py-10">
        <div className="flex w-full max-w-md flex-col gap-5">
          {/* Header Banner */}
          <section
            className="relative overflow-hidden rounded-3xl p-5 text-white shadow-lg shadow-orange-500/20 md:p-6"
            style={{
              background: "linear-gradient(135deg, #F66750 0%, #F97316 100%)",
            }}
          >
            <Image
              src="/iconlgn.svg"
              alt=""
              aria-hidden="true"
              width={110}
              height={110}
              className="pointer-events-none absolute -bottom-3 -right-2 h-28 w-28 opacity-15 md:h-28 md:w-28"
            />

            <div className="relative flex flex-col items-start gap-3">
              <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-light">
                Atur Ulang Sandi
              </span>
              <h1 className="text-xl font-bold leading-tight md:text-2xl">
                Reset Kata Sandi
              </h1>
              <p className="max-w-[16rem] font-light text-xs leading-relaxed text-white/80 md:max-w-xs md:text-sm">
                Buat kata sandi baru yang aman untuk akun Bisara Anda.
              </p>
            </div>
          </section>

          {/* Suspense Container for useSearchParams */}
          <Suspense
            fallback={
              <section className="rounded-3xl bg-white p-6 shadow-sm text-center">
                <Loader2
                  size={28}
                  className="mx-auto animate-spin text-[#F66750]"
                />
                <p className="mt-3 text-xs text-slate-500">
                  Memeriksa tautan reset password...
                </p>
              </section>
            }
          >
            <ResetPasswordContent />
          </Suspense>

          {/* Links */}
          <div className="flex flex-col items-center gap-3 text-center">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-[#F66750] hover:underline"
            >
              <ArrowLeft size={16} />
              Kembali ke halaman masuk
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
