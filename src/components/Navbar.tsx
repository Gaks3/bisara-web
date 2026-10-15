import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <header className="w-full bg-white">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-8 md:py-5"
      >
        {/* Logo + nama + tagline (kiri) */}
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2"
          aria-label="Bisara - Beranda"
        >
          <span className="flex shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(45deg,#F66750_0%,#FB923C_100%)] p-2">
            <Image
              src="/logo.svg"
              alt="Logo Bisara"
              width={56}
              height={56}
              priority
              className="h-8 w-8 md:h-10 md:w-10"
            />
          </span>

          <span className="flex min-w-0 flex-col items-start gap-1">
            <Image
              src="/bisara.svg"
              alt="Bisara"
              width={96}
              height={28}
              priority
              className="h-4 w-auto self-start object-contain object-left"
            />
            <span className="truncate text-[11px] text-slate-500 md:text-sm">
              Bahasa Isyarat Untuk Semua
            </span>
          </span>
        </Link>

        {/* Badge Aksesibelitas (kanan) */}
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 py-1 pl-1.5 pr-3 text-xs font-semibold text-[#F66750] transition hover:bg-red-100 md:gap-2 md:text-sm"
        >
          <Image
            src="/aksesibelitas.svg"
            alt=""
            aria-hidden="true"
            width={24}
            height={24}
            className="h-6 w-6 md:h-7 md:w-7"
          />
          Aksesibilitas
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
