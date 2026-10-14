import Link from "next/link";

const links = [
  { label: "Bantuan Aksesibilitas", href: "/aksesibilitas" },
  { label: "Privasi", href: "/privasi" },
  { label: "Syarat", href: "/syarat" },
];

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-center md:gap-3 md:px-8 md:py-8">
        <nav aria-label="Tautan footer">
          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 md:gap-x-4">
            {links.map((link, index) => (
              <li key={link.href} className="flex items-center gap-3 md:gap-4">
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-slate-500"
                  />
                )}
                <Link
                  href={link.href}
                  className="text-sm font-medium text-slate-600 transition hover:text-slate-900 md:text-base"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-xs text-slate-400 md:text-sm">
          © {new Date().getFullYear()} Bisara. Aksesibilitas Untuk Semua.
        </p>
      </div>
    </footer>
  );
};

export default Footer;