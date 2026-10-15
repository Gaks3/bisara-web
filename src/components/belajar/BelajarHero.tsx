interface BelajarHeroProps {
  doneCount: number;
  totalLevels: number;
}

export const BelajarHero = ({ doneCount, totalLevels }: BelajarHeroProps) => {
  const progressPercent = totalLevels ? (doneCount / totalLevels) * 100 : 0;

  return (
    <section className="rounded-3xl bg-[#F97316] p-5 text-white md:p-8">
      <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider md:text-xs">
        Modul Praktik BISINDO
      </span>
      <h1 className="mt-3 text-xl font-bold leading-tight md:text-3xl">
        Pusat Belajar Bahasa Isyarat
      </h1>
      <p className="mt-2 text-xs leading-relaxed text-white/90 md:text-base">
        Selesaikan setiap level sampai 100% untuk membuka level berikutnya.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-bold md:text-sm">
          {doneCount}/{totalLevels} level
        </span>
      </div>
    </section>
  );
};
