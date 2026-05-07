import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * `cn` — Tailwind class concatenator with conflict resolution.
 * The single utility every component should use to compose class lists.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
