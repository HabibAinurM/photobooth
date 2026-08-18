import { DailyStats } from "@/types";

const STATS_KEY = "photobooth:stats";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function emptyStats(): DailyStats {
  return {
    photosToday: 0,
    downloadsToday: 0,
    visitorsToday: 0,
    frameCounts: {},
    lastResetDate: todayKey(),
  };
}

export function getStats(): DailyStats {
  if (typeof window === "undefined") return emptyStats();
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    const stats: DailyStats = raw ? JSON.parse(raw) : emptyStats();
    if (stats.lastResetDate !== todayKey()) {
      const fresh = emptyStats();
      window.localStorage.setItem(STATS_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return stats;
  } catch {
    return emptyStats();
  }
}

function setStats(stats: DailyStats) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordVisitor() {
  const stats = getStats();
  stats.visitorsToday += 1;
  setStats(stats);
}

export function recordSessionComplete(frameId: string) {
  const stats = getStats();
  stats.photosToday += 1;
  stats.frameCounts[frameId] = (stats.frameCounts[frameId] ?? 0) + 1;
  setStats(stats);
}

export function recordDownload() {
  const stats = getStats();
  stats.downloadsToday += 1;
  setStats(stats);
}

export function getFavoriteFrame(): string | null {
  const stats = getStats();
  const entries = Object.entries(stats.frameCounts);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}
