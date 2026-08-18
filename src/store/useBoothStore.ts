import { create } from "zustand";
import { BoothStep, PrintSize, StickerId } from "@/types";
import { PHOTOS_PER_SESSION } from "@/lib/frames";

interface BoothState {
  step: BoothStep;
  queueNumber: number;
  frameId: string | null;
  printSize: PrintSize;
  photos: (string | null)[];
  name: string;
  stickers: StickerId[];
  composedImage: string | null;

  goTo: (step: BoothStep) => void;
  startNewSession: () => void;
  selectFrame: (frameId: string) => void;
  setPrintSize: (size: PrintSize) => void;
  setPhoto: (index: number, dataUrl: string) => void;
  retakePhoto: (index: number) => void;
  retakeAll: () => void;
  setName: (name: string) => void;
  toggleSticker: (sticker: StickerId) => void;
  setComposedImage: (dataUrl: string | null) => void;
  reset: () => void;
}

let queueCounter = Math.floor(Math.random() * 40) + 1;

export const useBoothStore = create<BoothState>((set, get) => ({
  step: "start",
  queueNumber: queueCounter,
  frameId: null,
  printSize: "strip",
  photos: Array(PHOTOS_PER_SESSION).fill(null),
  name: "",
  stickers: [],
  composedImage: null,

  goTo: (step) => set({ step }),

  startNewSession: () => {
    queueCounter += 1;
    set({
      step: "frame",
      queueNumber: queueCounter,
      frameId: null,
      photos: Array(PHOTOS_PER_SESSION).fill(null),
      name: "",
      stickers: [],
      composedImage: null,
    });
  },

  selectFrame: (frameId) => set({ frameId }),
  setPrintSize: (printSize) => set({ printSize }),

  setPhoto: (index, dataUrl) => {
    const photos = [...get().photos];
    photos[index] = dataUrl;
    set({ photos });
  },

  retakePhoto: (index) => {
    const photos = [...get().photos];
    photos[index] = null;
    set({ photos, step: "camera" });
  },

  retakeAll: () =>
    set({ photos: Array(PHOTOS_PER_SESSION).fill(null), step: "camera" }),

  setName: (name) => set({ name }),

  toggleSticker: (sticker) => {
    const stickers = get().stickers.includes(sticker)
      ? get().stickers.filter((s) => s !== sticker)
      : [...get().stickers, sticker];
    set({ stickers });
  },

  setComposedImage: (composedImage) => set({ composedImage }),

  reset: () =>
    set({
      step: "start",
      frameId: null,
      photos: Array(PHOTOS_PER_SESSION).fill(null),
      name: "",
      stickers: [],
      composedImage: null,
    }),
}));
