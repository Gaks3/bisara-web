"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  UserPlus,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { authClient } from "@/lib/auth-client";

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

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleLoginWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      errorCallbackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/error`,
    });
  };

  return (
    <>
      <Navbar />

      <main className="flex flex-1 flex-col items-center bg-[#F8FAFC] px-4 py-6 md:py-10">
        <div className="flex w-full max-w-md flex-col gap-5">
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
                Halo, Teman Bisara!
              </span>
              <h1 className="text-xl font-bold leading-tight md:text-2xl">
                Selamat Datang di Bisara
              </h1>
              <p className="max-w-[16rem] font-light text-xs leading-relaxed text-white/70 md:max-w-xs md:text-sm">
                Mari belajar bahasa isyarat dengan mudah, ramah, dan bebas
                hambatan.
              </p>
            </div>
          </section>

          <div
            role="tablist"
            aria-label="Pilih Masuk atau Daftar"
            className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected="true"
              className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-[#F66750] shadow-sm"
            >
              <LogIn size={16} />
              Masuk
            </button>
            <Link
              href="/register"
              role="tab"
              aria-selected="false"
              className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
            >
              <UserPlus size={16} />
              Daftar Akun
            </Link>
          </div>

          <section className="rounded-3xl bg-white p-5 shadow-sm md:p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="identifier"
                  className="text-sm font-semibold text-slate-700"
                >
                  Email atau Nama Pengguna
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="contoh@email.com"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#F66750] focus:outline-none focus:ring-2 focus:ring-[#F66750]/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Kata Sandi
                  </label>
                  <Link
                    href="/lupa-password"
                    className="text-xs font-semibold text-[#F66750] hover:underline"
                  >
                    Lupa Kata Sandi?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#F66750] focus:outline-none focus:ring-2 focus:ring-[#F66750]/20"
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
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 rounded border-slate-300 accent-[#F66750]"
                />
                Ingat saya di perangkat ini
              </label>

              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105 active:scale-[0.99]"
                style={{
                  background:
                    "linear-gradient(135deg, #F66750 0%, #F97316 100%)",
                }}
              >
                Masuk Sekarang
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                atau
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                onClick={handleLoginWithGoogle}
                type="button"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <GoogleIcon />
                Masuk dengan Google
              </button>

              {/* <button
                type="button"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-[#F66750] transition hover:bg-red-100"
              >
                <Camera size={18} />
                Masuk dengan Bahasa Isyarat (Visual ID)
              </button> */}
            </form>
          </section>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-sm font-semibold text-[#F66750] hover:underline"
          >
            <ArrowLeft size={16} />
            Kembali ke halaman utama
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Login;
