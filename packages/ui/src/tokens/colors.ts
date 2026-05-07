/**
 * Color tokens — strict monochrome with one restrained accent.
 *
 * Dark is the default theme. Light is a peer, not a derivation.
 * The accent is used for <5% of pixels — never for body text, never
 * for backgrounds larger than a button or pill.
 */

export type ColorScheme = 'light' | 'dark';

export const colors = {
  dark: {
    bg: '#0A0A0A',
    bgElev: '#131313',
    fg: '#F5F5F5',
    fgMuted: '#888888',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    accent: '#4FD1C5',
    accentMuted: 'rgba(79, 209, 197, 0.16)',
    danger: '#F87171',
    success: '#4ADE80',
    warning: '#FBBF24',
  },
  light: {
    bg: '#FAFAFA',
    bgElev: '#FFFFFF',
    fg: '#0A0A0A',
    fgMuted: '#6B6B6B',
    border: 'rgba(0, 0, 0, 0.08)',
    borderStrong: 'rgba(0, 0, 0, 0.16)',
    accent: '#4FD1C5',
    accentMuted: 'rgba(79, 209, 197, 0.12)',
    danger: '#DC2626',
    success: '#16A34A',
    warning: '#D97706',
  },
} as const;

/**
 * CSS variable names. Apps/admin attach these to :root and .dark via
 * the global stylesheet so Tailwind utilities resolve via var().
 */
export const cssVarNames = {
  bg: '--bg',
  bgElev: '--bg-elev',
  fg: '--fg',
  fgMuted: '--fg-muted',
  border: '--border',
  borderStrong: '--border-strong',
  accent: '--accent',
  accentMuted: '--accent-muted',
  danger: '--danger',
  success: '--success',
  warning: '--warning',
} as const;

export type ColorToken = keyof typeof cssVarNames;
