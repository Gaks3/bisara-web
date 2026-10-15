"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as ortTypes from "onnxruntime-web";
import {
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

const SEQUENCE_LENGTH = 30;
const FEATURE_SIZE = 258; // 33*4 (Pose) + 21*3 (Left Hand) + 21*3 (Right Hand)

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
  bufferProgress: number; // 0 - 30 frame
}

function softmax(logits: Float32Array | number[]): number[] {
  const arr = Array.from(logits);
  const maxLogit = Math.max(...arr);
  const exps = arr.map((x) => Math.exp(x - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map((x) => x / sumExps);
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
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const classesRef = useRef<string[]>(["1", "A", "hari", "idle"]);
  const sequenceBufferRef = useRef<number[][]>([]);
  const rafIdRef = useRef<number | null>(null);
  const isInferringRef = useRef(false);

  // 1. Inisialisasi ONNX Runtime Web + MediaPipe + classes.json
  const initModels = useCallback(async () => {
    if (
      sessionRef.current &&
      poseLandmarkerRef.current &&
      handLandmarkerRef.current
    ) {
      return;
    }

    setIsModelLoading(true);
    setModelError(null);

    try {
      // Load daftar kelas dari public/classes.json
      const clsRes = await fetch("/classes.json");
      if (clsRes.ok) {
        const clsData: ClassesConfig = await clsRes.json();
        classesRef.current = clsData.classes;
      }

      // Dynamic import onnxruntime-web agar hanya berjalan di sisi client
      const ort = await import("onnxruntime-web");
      ortRef.current = ort;

      // Arahkan path file .wasm ke CDN sesuai versi yang terinstal
      ort.env.wasm.wasmPaths = "/wasm/";
      ort.env.wasm.numThreads = 1;

      // PENTING: Muat bisindo_model.onnx beserta bobot eksternalnya bisindo_model.onnx.data
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

      // Inisialisasi MediaPipe Pose & Hand Landmarker
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm",
      );

      const [poseLandmarker, handLandmarker] = await Promise.all([
        PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        }),
        HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        }),
      ]);

      poseLandmarkerRef.current = poseLandmarker;
      handLandmarkerRef.current = handLandmarker;
      setIsModelReady(true);
    } catch (err) {
      console.error("Gagal memuat model AI BISINDO:", err);
      setModelError(
        err instanceof Error ? err.message : "Gagal memuat model deteksi AI.",
      );
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  // 2. Ekstraksi 258 fitur dari 1 frame video
  const extract258Keypoints = useCallback(
    (video: HTMLVideoElement, timestampMs: number): number[] => {
      const poseResult = poseLandmarkerRef.current?.detectForVideo(
        video,
        timestampMs,
      );
      const handResult = handLandmarkerRef.current?.detectForVideo(
        video,
        timestampMs,
      );

      // Pose: 33 landmarks * 4 (x, y, z, visibility) = 132
      const poseFeatures = new Array<number>(132).fill(0);
      if (poseResult?.landmarks?.[0]) {
        poseResult.landmarks[0].forEach((lm, idx) => {
          const offset = idx * 4;
          poseFeatures[offset] = lm.x;
          poseFeatures[offset + 1] = lm.y;
          poseFeatures[offset + 2] = lm.z;
          poseFeatures[offset + 3] = lm.visibility ?? 0;
        });
      }

      // Left Hand & Right Hand: masing-masing 21 landmarks * 3 (x, y, z) = 63
      const leftHandFeatures = new Array<number>(63).fill(0);
      const rightHandFeatures = new Array<number>(63).fill(0);

      if (handResult?.landmarks && handResult?.handedness) {
        handResult.handedness.forEach((handCategories, handIdx) => {
          const categoryName = handCategories[0]?.categoryName; // "Left" atau "Right"
          const landmarks = handResult.landmarks[handIdx];
          if (!landmarks) return;

          const targetArray =
            categoryName === "Left" ? leftHandFeatures : rightHandFeatures;

          landmarks.forEach((lm, lmIdx) => {
            const offset = lmIdx * 3;
            targetArray[offset] = lm.x;
            targetArray[offset + 1] = lm.y;
            targetArray[offset + 2] = lm.z;
          });
        });
      }

      return [...poseFeatures, ...leftHandFeatures, ...rightHandFeatures];
    },
    [],
  );

  // 3. Loop deteksi real-time per frame (hanya jalan saat isActive dan model sudah siap)
  useEffect(() => {
    if (!isActive || !isModelReady) {
      sequenceBufferRef.current = [];
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      return;
    }

    let isCancelled = false;
    let lastVideoTime = -1;

    const detectFrame = async () => {
      if (isCancelled) return;

      const video = videoRef.current;
      const ort = ortRef.current;
      const session = sessionRef.current;

      if (
        video &&
        video.readyState >= 2 &&
        ort &&
        session &&
        poseLandmarkerRef.current &&
        handLandmarkerRef.current &&
        video.currentTime !== lastVideoTime
      ) {
        lastVideoTime = video.currentTime;
        const nowMs = performance.now();

        // Ekstrak 258 titik koordinat dan masukkan ke sliding window 30 frame
        const keypoints = extract258Keypoints(video, nowMs);
        sequenceBufferRef.current.push(keypoints);
        if (sequenceBufferRef.current.length > SEQUENCE_LENGTH) {
          sequenceBufferRef.current.shift();
        }

        const currentBufferLength = sequenceBufferRef.current.length;

        // Jalankan inferensi LSTM ketika buffer sudah mencapai 30 frame
        if (
          currentBufferLength === SEQUENCE_LENGTH &&
          !isInferringRef.current
        ) {
          isInferringRef.current = true;
          try {
            const flatData = new Float32Array(SEQUENCE_LENGTH * FEATURE_SIZE);
            for (let i = 0; i < SEQUENCE_LENGTH; i++) {
              flatData.set(sequenceBufferRef.current[i], i * FEATURE_SIZE);
            }

            // Buat tensor [1, 30, 258] sesuai input_landmarks
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

            if (!isCancelled) {
              setDetection({
                label: classes[maxIdx] || "idle",
                confidence: probs[maxIdx] || 0,
                probabilities: probMap,
                bufferProgress: SEQUENCE_LENGTH,
              });
            }
          } catch (err) {
            console.error("Kesalahan saat inferensi ONNX LSTM:", err);
          } finally {
            isInferringRef.current = false;
          }
        } else if (currentBufferLength < SEQUENCE_LENGTH) {
          setDetection((prev) => ({
            ...prev,
            bufferProgress: currentBufferLength,
          }));
        }
      }

      rafIdRef.current = requestAnimationFrame(detectFrame);
    };

    rafIdRef.current = requestAnimationFrame(detectFrame);

    return () => {
      isCancelled = true;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isActive, isModelReady, extract258Keypoints, videoRef]);

  return {
    isModelLoading,
    isModelReady,
    modelError,
    detection,
    /** Memuat model secara manual (akan di-skip jika sudah dimuat) */
    loadModels: initModels,
  };
}
