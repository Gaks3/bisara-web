import { LevelCard } from "./LevelCard";
import { LevelStateItem } from "./types";

interface LevelMapProps {
  levelStates: LevelStateItem[];
  onStartLevel: (slug?: string) => void;
}

export const LevelMap = ({ levelStates, onStartLevel }: LevelMapProps) => {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400 md:text-sm">
        Peta Level Pembelajaran
      </h2>

      <div className="flex flex-col">
        {levelStates.map(
          ({ level, state, totalChapters, completedChapters, percent }, idx) => {
            const isLast = idx === levelStates.length - 1;
            const nextUnlocked =
              !isLast && levelStates[idx + 1].state !== "locked";

            return (
              <div
                key={`${level.code}-${level.title}`}
                className="flex flex-col items-center"
              >
                <LevelCard
                  level={level}
                  state={state}
                  totalChapters={totalChapters}
                  completedChapters={completedChapters}
                  percent={percent}
                  onStart={onStartLevel}
                />

                {/* Konektor antar level */}
                {!isLast && (
                  <div
                    className={`h-8 w-0.5 rounded-full ${
                      nextUnlocked ? "bg-[#F97316]" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          }
        )}
      </div>
    </section>
  );
};
