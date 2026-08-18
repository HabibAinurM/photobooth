export type PrintSize = "strip" | "4r";

export type FrameCategory = "utama" | "lomba";

export interface FrameDef {
  id: string;
  name: string;
  emoji: string;
  category: FrameCategory;
  /** Tailwind gradient classes for the selector card preview */
  swatch: string;
  /** Solid colors used when composing the final canvas */
  colors: {
    background: string;
    backgroundAlt?: string;
    border: string;
    accent: string;
    text: string;
    subtext: string;
  };
}

export type StickerId = "flag" | "party" | "medal" | "sparkle";

export interface StickerDef {
  id: StickerId;
  emoji: string;
  label: string;
}

export type BoothStep =
  | "start"
  | "frame"
  | "camera"
  | "preview"
  | "download";

export interface EventSettings {
  eventTitle: string;
  eventSubtitle: string;
  villageName: string;
  eventDate: string;
  stickersEnabled: boolean;
  kioskModeEnabled: boolean;
}

export interface DailyStats {
  photosToday: number;
  downloadsToday: number;
  visitorsToday: number;
  frameCounts: Record<string, number>;
  lastResetDate: string;
}
