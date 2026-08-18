"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBoothStore } from "@/store/useBoothStore";
import { getSettings } from "@/lib/settings";
import { EventSettings } from "@/types";
import StartScreen from "@/components/steps/StartScreen";
import FrameSelectScreen from "@/components/steps/FrameSelectScreen";
import CameraScreen from "@/components/steps/CameraScreen";
import PreviewScreen from "@/components/steps/PreviewScreen";
import DownloadScreen from "@/components/steps/DownloadScreen";

export default function Home() {
  const step = useBoothStore((s) => s.step);
  const [settings, setSettings] = useState<EventSettings | null>(null);

  useEffect(() => {
    setSettings(getSettings());
  }, [step]);

  if (!settings) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {step === "start" && <StartScreen settings={settings} />}
        {step === "frame" && <FrameSelectScreen />}
        {step === "camera" && <CameraScreen />}
        {step === "preview" && <PreviewScreen settings={settings} />}
        {step === "download" && <DownloadScreen settings={settings} />}
      </motion.div>
    </AnimatePresence>
  );
}
