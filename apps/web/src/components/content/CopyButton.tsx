'use client';

import { useState } from 'react';

export function CopyButton({ text, label = 'copy' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    setTimeout(() => setState('idle'), 1800);
  }
  return (
    <button type="button" onClick={copy} className="chip cursor-pointer text-accent" aria-live="polite">
      {state === 'copied' ? 'copied' : state === 'failed' ? 'copy failed' : label}
    </button>
  );
}
