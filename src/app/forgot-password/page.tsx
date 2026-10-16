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
  Loader2,
  LogIn,
  Mail,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { authClient } from "@/lib/auth-client";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (formData: ForgotPasswordFormData) => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const { error } = await authClient.requestPasswordReset({
        email: formData.email,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")}/reset-password`,
      });

      if (error) {
        console.error("Password reset error:", error);
        setErrorMessage(
          error.message ||
            "Gagal mengirimkan tautan pemulihan. Pastikan email Anda sudah benar.",
        );
        setLoading(false);
        return;
      }

      setSubmittedEmail(formData.email);
      setIsSubmittedSuccess(true);
      setSuccessMessage(
        "Tautan pemulihan kata sandi telah dikirimkan ke email Anda.",
      );
      setLoading(false);
    } catch (err: unknown) {
      console.error("Password reset error:", err);
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
        rawMsg || "Terjadi kesalahan. Silakan coba beberapa saat lagi.",
      );
      setLoading(false);
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
                Bantuan Akun
              </span>
              <h1 className="text-xl font-bold leading-tight md:text-2xl">
                Lupa Kata Sandi?
              </h1>
              <p className="max-w-[16rem] font-light text-xs leading-relaxed text-white/80 md:max-w-xs md:text-sm">
                Jangan khawatir! Masukkan email Anda dan kami akan mengirimkan
                tautan untuk mengatur ulang kata sandi.
              </p>
            </div>
          </section>

          {/* Form Card */}
          <section className="rounded-3xl bg-white p-5 shadow-sm md:p-6">
            {isSubmittedSuccess ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-[#F66750]">
                  <Mail size={32} />
                </div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Tautan Pemulihan Terkirim!
                </span>
                <h2 className="text-xl font-bold text-slate-800 md:text-2xl">
                  Periksa Email Anda
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Kami telah mengirimkan tautan untuk mengatur ulang kata sandi
                  ke:
                </p>
                <div className="mt-2 inline-flex max-w-full items-center gap-2 truncate rounded-xl bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-800">
                  <Mail size={16} className="shrink-0 text-[#F66750]" />
                  <span className="truncate">{submittedEmail}</span>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-500">
                  Silakan buka kotak masuk (inbox) atau folder spam email Anda
                  dan ikuti tautan yang tertera untuk membuat kata sandi baru.
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
                    Kembali ke Halaman Masuk
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmittedSuccess(false);
                      setSuccessMessage("");
                      setErrorMessage("");
                      reset();
                    }}
                    className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    Kirim ulang atau gunakan email lain
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
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Email Akun Anda
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
                        Mengirim Tautan...
                      </>
                    ) : (
                      <>
                        Kirim Tautan Pemulihan
                        <ArrowRight size={16} />
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
              Ingat kata sandi Anda?{" "}
              <Link
                href="/login"
                className="font-bold text-[#F66750] hover:underline"
              >
                Masuk di sini
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

export default ForgotPassword;
