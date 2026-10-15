/* Skeleton saat load awal */
export const BelajarSkeleton = () => (
  <div className="flex w-full animate-pulse flex-col gap-6">
    <div className="h-36 w-full rounded-3xl bg-slate-200" />
    <div className="flex flex-col gap-3">
      <div className="h-4 w-44 rounded bg-slate-200" />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5"
        >
          <div className="flex flex-col gap-2.5">
            <div className="h-5 w-20 rounded-md bg-slate-200" />
            <div className="h-6 w-44 rounded bg-slate-200" />
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="mt-1 h-9 w-28 rounded-xl bg-slate-200" />
          </div>
          <div className="h-16 w-16 shrink-0 rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  </div>
);
