'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@engine-room/ui';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      data-cursor="hover"
      aria-label="Copy code"
      className="absolute right-3 top-3 border border-border px-2 py-1 font-mono text-mono-sm text-fg-muted opacity-0 transition-opacity group-hover:opacity-100 hover:border-border-strong hover:text-accent"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose-engine-room', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-12 font-display text-display-md font-bold uppercase tracking-[2px] text-fg first:mt-0 [font-family:Orbitron,monospace]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 font-display text-display-sm font-bold uppercase tracking-[2px] text-fg first:mt-0 [font-family:Orbitron,monospace]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 font-display text-body font-bold uppercase tracking-[2px] text-fg first:mt-0 [font-family:Orbitron,monospace]">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mt-4 font-mono text-body text-fg/70 leading-relaxed first:mt-0">
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              data-cursor="hover"
              className="text-accent underline underline-offset-4 transition-colors hover:text-fg"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="mt-4 space-y-2 pl-5 font-mono text-fg/70">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-4 list-decimal space-y-2 pl-5 font-mono text-fg/70">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-body leading-relaxed marker:text-fg-muted">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mt-4 border-l-2 border-accent pl-4 font-mono text-fg/70 italic">
              {children}
            </blockquote>
          ),
          code: ({ className: cls, children, ...props }) => {
            const isInline = !cls;
            if (isInline) {
              return (
                <code className="border border-border bg-bg-elev px-1.5 py-0.5 font-mono text-mono-sm text-fg">
                  {children}
                </code>
              );
            }
            const codeText = String(children).replace(/\n$/, '');
            return (
              <div className="group relative mt-4">
                <pre tabIndex={0} className="overflow-x-auto border border-border bg-bg-elev p-4">
                  <code
                    className={cn(
                      'font-mono text-mono-sm text-fg block',
                      cls,
                    )}
                    {...props}
                  >
                    {codeText}
                  </code>
                </pre>
                <CopyButton text={codeText} />
              </div>
            );
          },
          pre: ({ children }) => <>{children}</>,
          hr: () => <hr className="my-8 border-border" />,
          table: ({ children }) => (
            <div tabIndex={0} className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-body-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-3 py-2 text-left font-medium text-fg">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2 text-fg-muted">
              {children}
            </td>
          ),
          strong: ({ children }) => (
            <strong className="font-medium text-fg">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-fg-muted">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
