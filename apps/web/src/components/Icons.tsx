type IconProps = {
  className?: string;
};

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M4 12L12 4M12 4H6M12 4V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.5 10.5L13.5 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PageIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 6H10M6 9H10M6 12H8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.5 6L8 9.75L13.5 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M8 2V10M5 7L8 10L11 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 14H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.75 8H13.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M8 2.5C9.5 4 10.25 5.8 10.25 8C10.25 10.2 9.5 12 8 13.5C6.5 12 5.75 10.2 5.75 8C5.75 5.8 6.5 4 8 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GitHubIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M8 1.75C4.55 1.75 1.75 4.55 1.75 8C1.75 10.76 3.54 13.1 6.02 13.93C6.33 13.99 6.44 13.8 6.44 13.64V12.55C4.7 12.93 4.33 11.81 4.33 11.81C4.05 11.08 3.64 10.89 3.64 10.89C3.07 10.5 3.68 10.51 3.68 10.51C4.31 10.55 4.64 11.16 4.64 11.16C5.2 12.12 6.11 11.84 6.47 11.68C6.53 11.27 6.69 11 6.87 10.85C5.48 10.69 4.02 10.15 4.02 7.76C4.02 7.08 4.26 6.52 4.66 6.08C4.59 5.92 4.38 5.29 4.72 4.43C4.72 4.43 5.25 4.26 6.44 5.07C6.94 4.93 7.47 4.86 8 4.86C8.53 4.86 9.06 4.93 9.56 5.07C10.75 4.26 11.28 4.43 11.28 4.43C11.62 5.29 11.41 5.92 11.34 6.08C11.74 6.52 11.98 7.08 11.98 7.76C11.98 10.16 10.52 10.69 9.13 10.85C9.36 11.05 9.56 11.43 9.56 12.02V13.64C9.56 13.8 9.67 14 9.99 13.93C12.46 13.1 14.25 10.76 14.25 8C14.25 4.55 11.45 1.75 8 1.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M8 1.75L9.45 6.15L14 8L9.45 9.85L8 14.25L6.55 9.85L2 8L6.55 6.15L8 1.75Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  );
}
