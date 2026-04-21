import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date safely for client-side rendering to avoid hydration errors
 * Always format dates consistently: "Jan 1, 2026"
 */
export function formatDateSafe(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Use consistent locale-independent formatting
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  } catch {
    return 'Unknown date';
  }
}

/**
 * Format number for display with thousands separator
 * Use en-US locale for consistency
 */
export function formatNumberSafe(num: number): string {
  try {
    return new Intl.NumberFormat('en-US').format(num);
  } catch {
    return String(num);
  }
}
