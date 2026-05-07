'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@engine-room/ui';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        // Compact prose using design tokens only
        'prose-sm max-w-none text-fg',
        '[&_h1]:font-display [&_h1]:text-display-sm [&_h1]:font-medium [&_h1]:text-fg [&_h1]:mt-4 [&_h1]:mb-2',
        '[&_h2]:font-display [&_h2]:text-body [&_h2]:font-medium [&_h2]:text-fg [&_h2]:mt-3 [&_h2]:mb-1',
        '[&_h3]:font-display [&_h3]:text-body-sm [&_h3]:font-medium [&_h3]:text-fg [&_h3]:mt-2 [&_h3]:mb-1',
        '[&_p]:text-body-sm [&_p]:text-fg [&_p]:leading-relaxed [&_p]:mb-2',
        '[&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline',
        '[&_code]:font-mono [&_code]:text-mono-sm [&_code]:bg-bg-elev [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded-sm',
        '[&_pre]:bg-bg-elev [&_pre]:rounded-md [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:mb-2',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2 [&_ul_li]:text-body-sm [&_ul_li]:text-fg [&_ul_li]:mb-0.5',
        '[&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2 [&_ol_li]:text-body-sm [&_ol_li]:text-fg [&_ol_li]:mb-0.5',
        '[&_blockquote]:border-l-2 [&_blockquote]:border-border-strong [&_blockquote]:pl-3 [&_blockquote]:text-fg-muted [&_blockquote]:mb-2',
        '[&_hr]:border-border [&_hr]:my-3',
        '[&_table]:w-full [&_table]:border-collapse [&_table]:text-body-sm',
        '[&_th]:text-left [&_th]:text-fg-muted [&_th]:font-medium [&_th]:border-b [&_th]:border-border [&_th]:py-1 [&_th]:pr-3',
        '[&_td]:text-fg [&_td]:border-b [&_td]:border-border [&_td]:py-1 [&_td]:pr-3',
        '[&_img]:max-w-full [&_img]:rounded-md',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
