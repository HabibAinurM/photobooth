"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Camera, Check, RotateCcw, VideoOff } from "lucide-react";
import Button from "@/components/ui/Button";
import { useBoothStore } from "@/store/useBoothStore";
import { PHOTOS_PER_SESSION } from "@/lib/frames";

const videoConstraints = {
  width: 960,
  height: 1280,
  facingMode: "user",
};

export default function CameraScreen() {
  const webcamRef = useRef<Webcam>(null);
  const photos = useBoothStore((s) => s.photos);
  const setPhoto = useBoothStore((s) => s.setPhoto);
  const goTo = useBoothStore((s) => s.goTo);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [camError, setCamError] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const nextIndex = photos.findIndex((p) => p === null);
  const takenCount = photos.filter(Boolean).length;
  const done = nextIndex === -1;

  const capture = useCallback(() => {
    const shot = webcamRef.current?.getScreenshot();
    if (shot && nextIndex !== -1) {
      setPhoto(nextIndex, shot);
    }
    setFlash(true);
    window.setTimeout(() => setFlash(false), 350);
  }, [nextIndex, setPhoto]);

  const startCountdown = () => {
    if (isCapturing || done) return;
    setIsCapturing(true);
    let n = 3;
    setCountdown(n);
    const interval = window.setInterval(() => {
      n -= 1;
      if (n === 0) {
        window.clearInterval(interval);
        setCountdown(null);
        capture();
        setIsCapturing(false);
      } else {
        setCountdown(n);
      }
    }, 800);
  };

  return (
    <div className="min-h-dvh bg-malam px-5 py-8 text-white">
      <div className="mx-auto flex max-w-md flex-col">
        <button
          onClick={() => goTo("frame")}
          className="mb-4 flex items-center gap-1.5 self-start text-sm font-medium text-white/70 hover:text-white"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-black shadow-2xl">
          {!camError ? (
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMediaError={() => setCamError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-white/60">
              <VideoOff size={32} />
              <p className="max-w-[220px] text-center text-sm">
                Tidak bisa mengakses kamera. Izinkan akses kamera di browser
                lalu muat ulang halaman.
              </p>
            </div>
          )}

          <AnimatePresence>
            {flash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 bg-white"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {countdown !== null && (
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <span className="font-shout text-9xl text-white drop-shadow-lg">
                  {countdown}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {Array.from({ length: PHOTOS_PER_SESSION }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${
                  photos[i] ? "bg-emas" : "bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-1.5">
          {Array.from({ length: PHOTOS_PER_SESSION }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5 text-sm"
            >
              <span className="text-white/70">Foto {i + 1}</span>
              {photos[i] ? (
                <Check size={16} className="text-emas" />
              ) : (
                <span className="text-white/30">Menunggu</span>
              )}
            </div>
          ))}
        </div>

        {!done ? (
          <Button
            onClick={startCountdown}
            disabled={isCapturing || camError}
            size="lg"
            className="mt-6 w-full"
          >
            <Camera size={20} />
            {isCapturing ? "Bersiap..." : `Ambil Foto ${takenCount + 1}`}
          </Button>
        ) : (
          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              onClick={() => useBoothStore.getState().retakeAll()}
              className="flex-1 !bg-transparent !text-white/80 !border-white/20"
            >
              <RotateCcw size={16} />
              Ulangi
            </Button>
            <Button onClick={() => goTo("preview")} className="flex-1">
              Lihat Hasil
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
