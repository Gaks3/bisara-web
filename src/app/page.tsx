"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    const hasToken =
      typeof window !== "undefined" &&
      (localStorage.getItem("bisara_token") ||
        localStorage.getItem("token") ||
        document.cookie.includes("session_token"));

    if (hasToken) {
      router.replace("/home");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#F66750]" />
        <p className="text-sm font-semibold text-slate-500">Memuat Bisara...</p>
      </div>
    </div>
  );
}
