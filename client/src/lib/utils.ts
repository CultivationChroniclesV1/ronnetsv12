import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number with K, M, B suffixes
export function formatNumber(num: number): string {
  if (num === undefined || num === null) return "0";
  
  if (num < 1000) return Math.floor(num).toLocaleString();
  
  const exp = Math.floor(Math.log10(num) / 3);
  const suffix = "KMB"[exp - 1] || "T";
  const shortened = num / Math.pow(1000, exp);
  
  return `${shortened.toFixed(1)}${suffix}`;
}

// Format time from seconds
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${Math.floor(seconds % 60)}s`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

// Calculate time difference in seconds
export function getTimeDiffInSeconds(date1: string, date2: string): number {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return Math.abs(d2 - d1) / 1000;
}

// Calculate offline progress
export function calculateOfflineProgress(
  lastTime: string,
  currentTime: string,
  qiPerSecond: number,
  maxCap: number
): number {
  const secondsPassed = getTimeDiffInSeconds(lastTime, currentTime);
  // Cap offline progress to 12 hours max
  const cappedSeconds = Math.min(secondsPassed, 12 * 60 * 60);
  // Apply diminishing returns for longer offline periods
  const efficiencyFactor = Math.max(0.1, 1 - (cappedSeconds / (24 * 60 * 60)));
  const qiGained = cappedSeconds * qiPerSecond * efficiencyFactor;
  
  // Cap at max storage
  return Math.min(qiGained, maxCap);
}
