import { Check, Lock } from "lucide-react";
import { LevelStatus } from "./types";

// Satu warna brand: oranye #F97316 (Tailwind orange-500). Tidak ada gradient / hijau.
const ORANGE = "#F97316";

interface CircularProgressProps {
  percent: number;
  state: LevelStatus;
  size?: number;
  strokeWidth?: number;
}

/* Lingkaran progres */
export const CircularProgress = ({
  percent,
  state,
  size = 72,
  strokeWidth = 6,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = Math.min(100, Math.max(0, percent));
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className="relative flex shrink-0 select-none items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {state !== "locked" && value > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ORANGE}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {state === "locked" ? (
          <Lock size={18} className="text-slate-400" />
        ) : state === "done" ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F97316] text-white">
            <Check size={18} strokeWidth={3} />
          </span>
        ) : (
          <span className="text-sm font-extrabold text-slate-800">{value}%</span>
        )}
      </div>
    </div>
  );
};
