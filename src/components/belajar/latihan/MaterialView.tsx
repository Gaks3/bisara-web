import { useRef, useState } from "react";
import Image from "next/image";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { LessonMaterial } from "@/lib/api-service";
import { GRADIENT_BRAND } from "./types";

interface MaterialViewProps {
  material: LessonMaterial;
  materialIndex: number;
  totalMaterials: number;
  isLastMaterial: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export const MaterialView = ({
  material,
  materialIndex,
  totalMaterials,
  isLastMaterial,
  onNext,
  onPrev,
}: MaterialViewProps) => {
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const materialVideoRef = useRef<HTMLVideoElement>(null);

  const handleToggleSpeed = () => {
    const nextSpeed = playbackSpeed === 1 ? 0.5 : playbackSpeed === 0.5 ? 0.75 : 1;
    setPlaybackSpeed(nextSpeed);
    if (materialVideoRef.current) {
      materialVideoRef.current.playbackRate = nextSpeed;
    }
  };

  const isVideo =
    material.type === "VIDEO" ||
    !!material.mediaUrl?.match(/\.(mp4|webm|ogg)($|\?)/i);

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      {/* Header Materi */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-[#F66750]">
            <BookOpen size={16} />
          </span>
          <h2 className="text-sm font-bold text-slate-800 md:text-base">
            {material.title || "Materi Pembelajaran"}
          </h2>
        </div>
        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
          Materi {materialIndex + 1} / {totalMaterials}
        </span>
      </div>

      {/* Info Kata & Arti Isyarat */}
      {material.sign && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-3.5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-[#F66750]">
              Kata: {material.sign.word}
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Arti: {material.sign.meaning}
            </span>
          </div>
          {material.content && (
            <p className="text-xs text-slate-600">{material.content}</p>
          )}
          {material.sign.description && (
            <p className="text-[11px] text-slate-500 italic mt-0.5">
              &quot;{material.sign.description}&quot;
            </p>
          )}
        </div>
      )}

      {/* Media Preview: Video vs Image Flashcard */}
      {isVideo ? (
        <div className="flex flex-col gap-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black flex items-center justify-center shadow-inner">
            <video
              ref={materialVideoRef}
              src={material.mediaUrl || "/bannervidio.png"}
              controls
              playsInline
              className="h-full w-full rounded-2xl object-contain"
            />
          </div>
          {/* Video speed control */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-slate-500">
              Kecepatan Gerakan Isyarat:
            </span>
            <button
              type="button"
              onClick={handleToggleSpeed}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
            >
              {playbackSpeed}x Kecepatan
            </button>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-slate-50 flex items-center justify-center py-2 border border-slate-100">
          <Image
            src={material.mediaUrl || "/bannerflash.png"}
            alt={material.title || "Flashcard isyarat"}
            width={500}
            height={320}
            unoptimized={!!material.mediaUrl?.startsWith("http")}
            className="h-56 w-auto object-contain rounded-2xl select-none"
            priority
          />
        </div>
      )}

      {/* Bottom Navigation for Materials */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={materialIndex === 0}
          className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-slate-100 text-xs font-semibold text-slate-500 transition enabled:hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed md:text-sm"
        >
          <ChevronLeft size={16} />
          Sebelumnya
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex h-12 flex-[1.6] items-center justify-center gap-2 rounded-xl text-xs font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105 active:scale-95 md:text-sm"
          style={{ background: GRADIENT_BRAND }}
        >
          {isLastMaterial ? (
            <>
              Mulai Kerjakan Soal
              <ChevronRight size={18} />
            </>
          ) : (
            <>
              Materi Berikutnya
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </section>
  );
};
