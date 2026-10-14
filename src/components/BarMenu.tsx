'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, HandHelping, House, User, type LucideIcon } from "lucide-react";

const menus: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Beranda", href: "/home", icon: House },
  { label: "Belajar", href: "/belajar", icon: BookOpen },
  { label: "Kamus", href: "/kamus", icon: HandHelping },
  { label: "Profil", href: "/profile", icon: User },
];

const BarMenu = () => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Menu utama"
      className=" border-t border-slate-100 bg-white fixed bottom-0 left-0 right-0 z-50 w-full"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 md:max-w-2xl">
        {menus.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 transition-colors md:py-3 ${
                  active
                    ? "text-[#F66750]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon
                  size={24}
                  strokeWidth={active ? 2.25 : 2}
                  fill={
                    active || label === "Beranda" || label === "Belajar"
                      ? "currentColor"
                      : "none"
                  }
                  aria-hidden="true"
                />
                <span
                  className={`text-xs md:text-sm ${
                    active ? "font-semibold" : "font-medium"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BarMenu;