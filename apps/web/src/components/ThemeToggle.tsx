'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import type { Theme } from '@engine-room/types';
import { SPRING_SNAPPY } from '@engine-room/ui/motion';
import { cn } from '@engine-room/ui';

function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem('theme');
    if (value === 'light' || value === 'dark') return value;
  } catch {}
  return null;
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(getStoredTheme() ?? 'dark');
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
    document.documentElement.classList.toggle('light', next === 'light');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      data-cursor="hover"
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-md border border-border text-fg-muted hover:border-border-strong hover:text-fg',
        className,
      )}
    >
      {mounted ? (
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={SPRING_SNAPPY}
          className="block h-4 w-4"
          aria-hidden
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </motion.span>
      ) : (
        <span className="block h-4 w-4" aria-hidden />
      )}
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-full w-full" aria-hidden>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1V2.5M8 13.5V15M1 8H2.5M13.5 8H15M3.05 3.05L4.11 4.11M11.89 11.89L12.95 12.95M11.89 4.11L12.95 3.05M3.05 12.95L4.11 11.89"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-full w-full" aria-hidden>
      <path
        d="M13.5 9A5.5 5.5 0 0 1 7 2.5A5.5 5.5 0 1 0 13.5 9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
