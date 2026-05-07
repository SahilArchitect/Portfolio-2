'use client';

import { useState } from 'react';
import { cn } from '@engine-room/ui';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write markdown...',
  className,
  rows = 20,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Mobile tabs */}
      <div className="flex gap-1 border-b border-border pb-2 md:hidden">
        <button
          type="button"
          onClick={() => setTab('write')}
          className={cn(
            'rounded px-3 py-1 font-mono text-micro uppercase tracking-wider transition-colors',
            tab === 'write'
              ? 'bg-accent-muted text-accent'
              : 'text-fg-muted hover:text-fg',
          )}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={cn(
            'rounded px-3 py-1 font-mono text-micro uppercase tracking-wider transition-colors',
            tab === 'preview'
              ? 'bg-accent-muted text-accent'
              : 'text-fg-muted hover:text-fg',
          )}
        >
          Preview
        </button>
      </div>

      {/* Desktop: side-by-side. Mobile: tabs */}
      <div className="mt-2 flex gap-3">
        {/* Editor pane */}
        <div
          className={cn(
            'flex-1',
            tab === 'preview' ? 'hidden md:flex md:flex-col' : 'flex flex-col',
          )}
        >
          <p className="mb-1 hidden font-mono text-micro uppercase tracking-wider text-fg-muted md:block">
            Write
          </p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className={cn(
              'w-full resize-y rounded-md border border-border bg-bg-elev px-3 py-2',
              'font-mono text-mono-sm text-fg placeholder:text-fg-muted',
              'focus:border-border-strong focus:outline-none',
            )}
          />
        </div>

        {/* Preview pane */}
        <div
          className={cn(
            'flex-1 overflow-auto rounded-md border border-border bg-bg-elev px-3 py-2',
            tab === 'write' ? 'hidden md:block' : 'block',
          )}
          style={{ minHeight: `${rows * 1.5}rem` }}
        >
          <p className="mb-1 hidden font-mono text-micro uppercase tracking-wider text-fg-muted md:block">
            Preview
          </p>
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="font-mono text-micro text-fg-muted italic">Nothing to preview.</p>
          )}
        </div>
      </div>
    </div>
  );
}
