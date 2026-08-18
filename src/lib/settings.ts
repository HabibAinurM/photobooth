import { EventSettings } from "@/types";

const SETTINGS_KEY = "photobooth:settings";

export const DEFAULT_SETTINGS: EventSettings = {
  eventTitle: "DIRGAHAYU REPUBLIK INDONESIA KE-81",
  eventSubtitle: "Semarak Kemerdekaan",
  villageName: "Desa Jatirejo",
  eventDate: "17 Agustus 2026",
  stickersEnabled: true,
  kioskModeEnabled: false,
};

export function getSettings(): EventSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: EventSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
