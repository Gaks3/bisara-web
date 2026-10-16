"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nama lengkap wajib diisi")
      .min(2, "Nama minimal 2 karakter"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
    password: z
      .string()
      .min(1, "Kata sandi wajib diisi")
      .min(8, "Kata sandi minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "Anda harus menyetujui Syarat dan Ketentuan",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok dengan kata sandi",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"
    />
    <path
      fill="#FBBC05"
      d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
    />
  </svg>
);

const Register = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isRegisteredSuccess, setIsRegisteredSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")}/login?verified=true`,
      });

      if (res?.error) {
        console.error("Register auth error:", res.error);
        const msg =
          res.error.message ||
          "Gagal mendaftar. Silakan periksa kembali data Anda.";
        setErrorMessage(msg);
        setLoading(false);
        return;
      }

      setRegisteredEmail(data.email);
      setIsRegisteredSuccess(true);
      setSuccessMessage(
        "Pendaftaran berhasil! Tautan verifikasi telah dikirimkan ke email Anda.",
      );
      setLoading(false);
    } catch (err: unknown) {
      console.error("Register error:", err);
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

      setErrorMessage(rawMsg || "Gagal mendaftar. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const handleRegisterWithGoogle = async () => {
    setErrorMessage("");
    setGoogleLoading(true);

    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/home`
          : "/home";
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectUrl,
        errorCallbackURL: `${redirectUrl}?error=google_failed`,
      });
    } catch (err: unknown) {
      console.error("Google login error:", err);
      // Fallback: direct redirect to backend endpoint
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      // eslint-disable-next-line
      window.location.href = `${baseUrl}/api/auth/sign-in/google?callbackURL=${encodeURIComponent(
        window.location.origin + "/home",
      )}`;
    } finally {
      setTimeout(() => setGoogleLoading(false), 2000);
    }
  };

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
                Mulai Langkah Pertamamu!
              </span>
              <h1 className="text-xl font-bold leading-tight md:text-2xl">
                Buat Akun Bisara Baru
              </h1>
              <p className="max-w-[16rem] font-light text-xs leading-relaxed text-white/80 md:max-w-xs md:text-sm">
                Bergabunglah dan mulai belajar bahasa isyarat BISINDO secara
                interaktif & inklusif.
              </p>
            </div>
          </section>

          {/* Tab Masuk / Daftar */}
          <div
            role="tablist"
            aria-label="Pilih Masuk atau Daftar"
            className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1"
          >
            <Link
              href="/login"
              role="tab"
              aria-selected="false"
              className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
            >
              <LogIn size={16} />
              Masuk
            </Link>
            <button
              type="button"
              role="tab"
              aria-selected="true"
              className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-[#F66750] shadow-sm"
            >
              <UserPlus size={16} />
              Daftar Akun
            </button>
          </div>

          {/* Form Card */}
          <section className="rounded-3xl bg-white p-5 shadow-sm md:p-6">
            {isRegisteredSuccess ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-[#F66750]">
                  <Mail size={32} />
                </div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Pendaftaran Berhasil!
                </span>
                <h2 className="text-xl font-bold text-slate-800 md:text-2xl">
                  Periksa Email Anda
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Tautan verifikasi telah dikirimkan ke alamat email:
                </p>
                <div className="mt-2 inline-flex max-w-full items-center gap-2 truncate rounded-xl bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-800">
                  <Mail size={16} className="shrink-0 text-[#F66750]" />
                  <span className="truncate">{registeredEmail}</span>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-500">
                  Silakan buka kotak masuk (inbox) atau folder spam email Anda,
                  lalu klik tautan verifikasi untuk mengaktifkan akun Bisara
                  Anda sebelum masuk.
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
                    Menuju Halaman Masuk
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisteredSuccess(false);
                      setSuccessMessage("");
                      setErrorMessage("");
                      reset();
                    }}
                    className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    Daftar dengan email lain
                  </button>
                </div>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div
                    role="alert"
                    className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
                  >
                    <AlertCircle size={18} className="shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div
                    role="status"
                    className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700"
                  >
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-emerald-500"
                    />
                    <span>{successMessage}</span>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="flex flex-col gap-4"
                >
                  {/* Nama Lengkap */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="name"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="name"
                        type="text"
                        {...register("name")}
                        autoComplete="name"
                        placeholder="cth. Budi Pratama"
                        className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
                          errors.name
                            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                            : "border-slate-200 focus:border-[#F66750] focus:ring-[#F66750]/20"
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{errors.name.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="email"
                        type="email"
                        {...register("email")}
                        autoComplete="email"
                        placeholder="contoh@email.com"
                        className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
                          errors.email
                            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                            : "border-slate-200 focus:border-[#F66750] focus:ring-[#F66750]/20"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{errors.email.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Kata Sandi */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        autoComplete="new-password"
                        placeholder="Minimal 8 karakter"
                        className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-12 text-sm text-slate-700 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
                          errors.password
                            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                            : "border-slate-200 focus:border-[#F66750] focus:ring-[#F66750]/20"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword
                            ? "Sembunyikan kata sandi"
                            : "Tampilkan kata sandi"
                        }
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{errors.password.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Konfirmasi Kata Sandi */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Konfirmasi Kata Sandi
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
                        placeholder="Ulangi kata sandi"
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
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{errors.confirmPassword.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Persetujuan Syarat & Ketentuan */}
                  <div className="flex flex-col gap-1">
                    <label className="flex cursor-pointer items-start gap-2.5 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        {...register("agreeTerms")}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#F66750]"
                      />
                      <span className="leading-snug">
                        Saya menyetujui{" "}
                        <Link
                          href="/syarat-ketentuan"
                          className="font-medium text-[#F66750] hover:underline"
                        >
                          Syarat & Ketentuan
                        </Link>{" "}
                        serta{" "}
                        <Link
                          href="/kebijakan-privasi"
                          className="font-medium text-[#F66750] hover:underline"
                        >
                          Kebijakan Privasi
                        </Link>{" "}
                        Bisara.
                      </span>
                    </label>
                    {errors.agreeTerms && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{errors.agreeTerms.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105 active:scale-[0.99] disabled:cursor-wait disabled:opacity-75"
                    style={{
                      background:
                        "linear-gradient(135deg, #F66750 0%, #F97316 100%)",
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Memproses Pendaftaran...
                      </>
                    ) : (
                      <>
                        Daftar Sekarang
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="h-px flex-1 bg-slate-200" />
                    atau daftar dengan
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  {/* Google Button */}
                  <button
                    onClick={handleRegisterWithGoogle}
                    type="button"
                    disabled={googleLoading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-70"
                  >
                    {googleLoading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin text-slate-500"
                        />
                        Menghubungkan ke Google...
                      </>
                    ) : (
                      <>
                        <GoogleIcon />
                        Daftar dengan Google
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </section>

          {/* Links */}
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-slate-600">
              Sudah memiliki akun Bisara?{" "}
              <Link
                href="/login"
                className="font-bold text-[#F66750] hover:underline"
              >
                Masuk sekarang
              </Link>
            </p>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-[#F66750] hover:underline"
            >
              <ArrowLeft size={16} />
              Kembali ke halaman utama
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Register;
