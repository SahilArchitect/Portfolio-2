/**
 * Shared Tailwind preset. Apps extend this — they do NOT redefine tokens.
 *
 * The token surface in `./tokens` is the source of truth. This preset
 * translates it into Tailwind's theme via CSS variables, so apps can
 * write `bg-bg`, `text-fg`, `border-border`, `text-accent`, etc.
 */

import type { Config } from 'tailwindcss';

import {
  fontFamilies,
  fontWeights,
  radii,
  spacing,
  typeScale,
  zIndex,
} from './tokens/index';

const preset = {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-elev': 'var(--bg-elev)',
        fg: 'var(--fg)',
        'fg-muted': 'var(--fg-muted)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        accent: 'var(--accent)',
        'accent-muted': 'var(--accent-muted)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        warning: 'var(--warning)',
      },
      fontFamily: {
        display: fontFamilies.display.split(',').map((f) => f.trim()),
        mono: fontFamilies.mono.split(',').map((f) => f.trim()),
      },
      fontWeight: {
        regular: String(fontWeights.regular),
        medium: String(fontWeights.medium),
        semibold: String(fontWeights.semibold),
      },
      fontSize: Object.fromEntries(
        Object.entries(typeScale).map(([key, [size, lh, ls]]) => [
          key,
          [size, { lineHeight: lh, letterSpacing: ls }],
        ]),
      ),
      spacing,
      borderRadius: radii,
      borderColor: {
        DEFAULT: 'var(--border)',
      },
      zIndex: Object.fromEntries(Object.entries(zIndex).map(([k, v]) => [k, String(v)])),
    },
  },
  plugins: [],
} satisfies Config;

export default preset;
