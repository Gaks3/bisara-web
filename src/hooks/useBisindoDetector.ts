// src/hooks/useBisindoDetector.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as ortTypes from "onnxruntime-web";
import type { Results as HolisticResults } from "@mediapipe/holistic";

const SEQUENCE_LENGTH = 30;
const FEATURE_SIZE = 258; // 33*4 (Pose) + 21*3 (Left Hand) + 21*3 (Right Hand)

/**
 * Ubah ke `true` jika di script Python Anda menggunakan `cv2.flip(frame, 1)`
 * SEBELUM memanggil `holistic.process(frame)`.
 * Ubah ke `false` jika di Python Anda TIDAK melakukan `cv2.flip` sebelum `holistic.process()`.
 */
const PYTHON_USED_CV2_FLIP = true;

interface ClassesConfig {
  classes: string[];
  class_to_idx: Record<string, number>;
  idx_to_class: Record<string, string>;
  num_classes: number;
}

export interface DetectionResult {
  label: string;
  confidence: number;
  probabilities: Record<string, number>;
  bufferProgress: number;
}

function softmax(logits: Float32Array | number[]): number[] {
  const arr = Array.from(logits);
  const maxLogit = Math.max(...arr);
  const exps = arr.map((x) => Math.exp(x - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map((x) => x / sumExps);
}

/**
 * Ekstraksi 258 fitur identik dengan np.concatenate([pose, lh, rh]) di Python MediaPipe Holistic
 */
function extractHolisticKeypoints(results: HolisticResults): number[] {
  // 1. Pose: 33 landmarks * 4 (x, y, z, visibility) = 132
  const pose = new Array<number>(132).fill(0);
  if (results.poseLandmarks) {
    results.poseLandmarks.forEach((lm, i) => {
      const offset = i * 4;
      pose[offset] = lm.x;
      pose[offset + 1] = lm.y;
      pose[offset + 2] = lm.z;
      pose[offset + 3] = lm.visibility ?? 0;
    });
  }

  // 2. Left Hand: 21 landmarks * 3 (x, y, z) = 63
  const lh = new Array<number>(63).fill(0);
  if (results.leftHandLandmarks) {
    results.leftHandLandmarks.forEach((lm, i) => {
      const offset = i * 3;
      lh[offset] = lm.x;
      lh[offset + 1] = lm.y;
      lh[offset + 2] = lm.z;
    });
  }

  // 3. Right Hand: 21 landmarks * 3 (x, y, z) = 63
  const rh = new Array<number>(63).fill(0);
  if (results.rightHandLandmarks) {
    results.rightHandLandmarks.forEach((lm, i) => {
      const offset = i * 3;
      rh[offset] = lm.x;
      rh[offset + 1] = lm.y;
      rh[offset + 2] = lm.z;
    });
  }

  return [...pose, ...lh, ...rh];
}

/**
 * Memuat ONNX Runtime Web secara tangguh.
 * Jika Webpack dynamic chunk gagal (ChunkLoadError), beralih memuat /wasm/ort.min.js via DOM script.
 */
async function loadOnnxRuntime(): Promise<typeof ortTypes> {
  if (typeof window !== "undefined" && (window as unknown as { ort?: typeof ortTypes }).ort) {
    return (window as unknown as { ort: typeof ortTypes }).ort;
  }

  // 1. Coba import dari onnxruntime-web
  try {
    const mod = await import("onnxruntime-web");
    if (mod && mod.InferenceSession) return mod;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((mod as any)?.default?.InferenceSession) return (mod as any).default;
  } catch (bundlerErr) {
    console.warn("Webpack dynamic import onnxruntime-web gagal, beralih ke script tag loader:", bundlerErr);
  }

  // 2. Fallback: Muat /wasm/ort.min.js via DOM script tag
  if (typeof window !== "undefined") {
    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector('script[data-ort="true"]') as HTMLScriptElement | null;
      if (existing) {
        if ((window as unknown as { ort?: typeof ortTypes }).ort) {
          resolve();
          return;
        }
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("Gagal memuat skrip ORT lokal")));
        return;
      }

      const script = document.createElement("script");
      script.dataset.ort = "true";
      script.src = "/wasm/ort.min.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        // Fallback CDN jika /wasm/ort.min.js bermasalah
        const cdn = document.createElement("script");
        cdn.dataset.ort = "true";
        cdn.src = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/ort.min.js";
        cdn.async = true;
        cdn.onload = () => resolve();
        cdn.onerror = (e) => reject(new Error("Gagal mengunduh onnxruntime-web dari lokal maupun CDN: " + String(e)));
        document.head.appendChild(cdn);
      };
      document.head.appendChild(script);
    });

    if ((window as unknown as { ort?: typeof ortTypes }).ort) {
      return (window as unknown as { ort: typeof ortTypes }).ort;
    }
  }

  throw new Error("Gagal menginisialisasi ONNX Runtime Web.");
}

export function useBisindoDetector(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isActive: boolean,
) {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [detection, setDetection] = useState<DetectionResult>({
    label: "idle",
    confidence: 0,
    probabilities: {},
    bufferProgress: 0,
  });

  const ortRef = useRef<typeof ortTypes | null>(null);
  const sessionRef = useRef<ortTypes.InferenceSession | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const holisticRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const classesRef = useRef<string[]>(["1", "A", "hari", "idle"]);
  const sequenceBufferRef = useRef<number[][]>([]);
  const rafIdRef = useRef<number | null>(null);
  const isInferringRef = useRef(false);
  const isProcessingFrameRef = useRef(false);

  const resetDetection = useCallback(() => {
    sequenceBufferRef.current = [];
    isInferringRef.current = false;
    setDetection({
      label: "idle",
      confidence: 0,
      probabilities: {},
      bufferProgress: 0,
    });
  }, []);

  const runOnnxInference = useCallback(async () => {
    const ort = ortRef.current;
    const session = sessionRef.current;
    if (
      !ort ||
      !session ||
      sequenceBufferRef.current.length < SEQUENCE_LENGTH ||
      isInferringRef.current
    ) {
      return;
    }

    isInferringRef.current = true;
    try {
      const flatData = new Float32Array(SEQUENCE_LENGTH * FEATURE_SIZE);
      for (let i = 0; i < SEQUENCE_LENGTH; i++) {
        flatData.set(sequenceBufferRef.current[i], i * FEATURE_SIZE);
      }

      const inputTensor = new ort.Tensor("float32", flatData, [
        1,
        SEQUENCE_LENGTH,
        FEATURE_SIZE,
      ]);

      const outputs = await session.run({
        input_landmarks: inputTensor,
      });

      const logits = outputs.output_logits.data as Float32Array;
      const probs = softmax(logits);

      let maxIdx = 0;
      for (let i = 1; i < probs.length; i++) {
        if (probs[i] > probs[maxIdx]) maxIdx = i;
      }

      const classes = classesRef.current;
      const probMap: Record<string, number> = {};
      classes.forEach((cls, idx) => {
        probMap[cls] = probs[idx] ?? 0;
      });

      setDetection({
        label: classes[maxIdx] || "idle",
        confidence: probs[maxIdx] || 0,
        probabilities: probMap,
        bufferProgress: SEQUENCE_LENGTH,
      });
    } catch (err) {
      console.error("Kesalahan inferensi ONNX:", err);
    } finally {
      isInferringRef.current = false;
    }
  }, []);

  const initModels = useCallback(async () => {
    if (sessionRef.current && holisticRef.current) return;

    setIsModelLoading(true);
    setModelError(null);

    try {
      // 1. Load classes.json
      const clsRes = await fetch("/classes.json");
      if (clsRes.ok) {
        const clsData: ClassesConfig = await clsRes.json();
        classesRef.current = clsData.classes;
      }

      // 2. Load ONNX Runtime Web (dengan fallback script loader)
      const ort = await loadOnnxRuntime();
      ortRef.current = ort;
      ort.env.wasm.wasmPaths = "/wasm/";
      ort.env.wasm.numThreads = 1;

      const [modelBuffer, externalDataBuffer] = await Promise.all([
        fetch("/bisindo_model.onnx").then((r) => r.arrayBuffer()),
        fetch("/bisindo_model.onnx.data").then((r) => r.arrayBuffer()),
      ]);

      sessionRef.current = await ort.InferenceSession.create(
        new Uint8Array(modelBuffer),
        {
          executionProviders: ["wasm"],
          externalData: [
            {
              path: "bisindo_model.onnx.data",
              data: new Uint8Array(externalDataBuffer),
            },
          ],
        },
      );

      // 3. Load MediaPipe Holistic (identik dengan mp.solutions.holistic di Python)
      let HolisticClass =
        (typeof window !== "undefined" && (window as unknown as { Holistic?: unknown }).Holistic) ||
        null;

      if (!HolisticClass) {
        try {
          const mpHolistic = await import("@mediapipe/holistic");
          HolisticClass =
            mpHolistic.Holistic ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mpHolistic as any).default?.Holistic ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Holistic;
        } catch (e) {
          console.warn("Gagal import @mediapipe/holistic via bundler, beralih ke CDN:", e);
        }
      }

      if (!HolisticClass && typeof window !== "undefined") {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675471629/holistic.js";
          s.crossOrigin = "anonymous";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Gagal mengunduh MediaPipe Holistic dari CDN"));
          document.head.appendChild(s);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        HolisticClass = (window as any).Holistic;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const holistic = new (HolisticClass as any)({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });

      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        refineFaceLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      holistic.onResults((results: HolisticResults) => {
        const keypoints = extractHolisticKeypoints(results);
        sequenceBufferRef.current.push(keypoints);
        if (sequenceBufferRef.current.length > SEQUENCE_LENGTH) {
          sequenceBufferRef.current.shift();
        }

        const count = sequenceBufferRef.current.length;
        if (count < SEQUENCE_LENGTH) {
          setDetection((prev) => ({ ...prev, bufferProgress: count }));
        } else {
          runOnnxInference();
        }
      });

      await holistic.initialize();
      holisticRef.current = holistic;
      setIsModelReady(true);

      // Siapkan offscreen canvas jika perlu simulasi cv2.flip(frame, 1)
      if (!canvasRef.current && typeof document !== "undefined") {
        canvasRef.current = document.createElement("canvas");
      }
    } catch (err) {
      console.error("Gagal memuat Holistic / ONNX:", err);
      setModelError(
        err instanceof Error ? err.message : "Gagal memuat model AI.",
      );
    } finally {
      setIsModelLoading(false);
    }
  }, [runOnnxInference]);

  useEffect(() => {
    if (!isActive) {
      sequenceBufferRef.current = [];
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      return;
    }

    let isCancelled = false;
    let lastVideoTime = -1;

    initModels().then(() => {
      const processLoop = async () => {
        if (isCancelled) return;

        const video = videoRef.current;
        const holistic = holisticRef.current;

        if (
          video &&
          video.readyState >= 2 &&
          holistic &&
          !isProcessingFrameRef.current &&
          video.currentTime !== lastVideoTime
        ) {
          lastVideoTime = video.currentTime;
          isProcessingFrameRef.current = true;

          try {
            if (PYTHON_USED_CV2_FLIP && canvasRef.current) {
              // Membalik piksel video secara horizontal sama seperti cv2.flip(frame, 1)
              const canvas = canvasRef.current;
              canvas.width = video.videoWidth || 640;
              canvas.height = video.videoHeight || 480;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(canvas, 0, 0); // clear
                ctx.drawImage(
                  video,
                  -canvas.width,
                  0,
                  canvas.width,
                  canvas.height,
                );
                ctx.restore();
                await holistic.send({ image: canvas });
              }
            } else {
              await holistic.send({ image: video });
            }
          } catch (e) {
            console.error("Holistic frame error:", e);
          } finally {
            isProcessingFrameRef.current = false;
          }
        }

        rafIdRef.current = requestAnimationFrame(processLoop);
      };

      rafIdRef.current = requestAnimationFrame(processLoop);
    });

    return () => {
      isCancelled = true;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isActive, initModels, videoRef]);

  return {
    isModelLoading,
    isModelReady,
    modelError,
    resetDetection,
    detection,
    /** Memuat model secara manual (akan di-skip jika sudah dimuat) */
    loadModels: initModels,
  };
}
