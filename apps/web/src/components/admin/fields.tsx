'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { MarkdownBlocks, type FigureDataMap } from '@/components/content/MarkdownBlocks';
import type { FieldSpec } from '@/lib/content/fields';
import type { RenderBlock } from '@/lib/markdown/render';

import { SortableList } from './SortableList';
import { UploadDialog } from './UploadDialog';

export type AssetOption = {
  id: string;
  url: string;
  contentType: string;
  altText: string;
  caption: string | null;
};

const inputClass =
  'mt-1 w-full rounded border border-rule bg-bg px-2 py-1.5 text-[15px] aria-[invalid=true]:border-red-700';

function ErrorText({ error }: { error?: string }) {
  if (!error) return null;
  return <span className="mt-1 block text-sm text-red-700 dark:text-red-400">{error}</span>;
}

function Label({ field, htmlFor }: { field: FieldSpec; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="meta block text-fg">
      {field.label}
    </label>
  );
}

function Help({ field }: { field: FieldSpec }) {
  return field.help ? <span className="meta mt-1 block">{field.help}</span> : null;
}

type Props = {
  field: FieldSpec;
  value: unknown;
  error?: string;
  errors: Record<string, string>;
  onChange: (value: unknown) => void;
  /** Image fields with `altPath`: receives the chosen asset's alt text. */
  onAltChange?: (alt: string) => void;
  assets: AssetOption[];
};

export function FieldControl(props: Props) {
  const { field, value, error, onChange } = props;
  const id = useId();
  const str = typeof value === 'string' ? value : value == null ? '' : String(value);

  switch (field.kind) {
    case 'bool':
      return (
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(event) => onChange(event.target.checked)}
            className="mt-1 accent-[var(--accent)]"
          />
          <span>
            <span className="text-[15px]">{field.label}</span>
            <Help field={field} />
          </span>
        </label>
      );
    case 'select':
      return (
        <div className="max-w-xs">
          <Label field={field} htmlFor={id} />
          <select
            id={id}
            value={str}
            onChange={(event) => onChange(event.target.value)}
            className={inputClass}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    case 'textarea':
      return (
        <div>
          <Label field={field} htmlFor={id} />
          <textarea
            id={id}
            value={str}
            rows={field.maxLength && field.maxLength <= 300 ? 2 : 4}
            onChange={(event) => onChange(event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(error)}
          />
          {field.maxLength && (
            <span className="meta block text-right">
              {str.length}/{field.maxLength}
            </span>
          )}
          <Help field={field} />
          <ErrorText error={error} />
        </div>
      );
    case 'number':
      return (
        <div className="max-w-xs">
          <Label field={field} htmlFor={id} />
          <input
            id={id}
            inputMode="numeric"
            value={str}
            onChange={(event) => {
              const raw = event.target.value.trim();
              if (raw === '' && field.optional) return onChange(undefined);
              onChange(/^-?\d+$/.test(raw) ? Number(raw) : raw);
            }}
            className={inputClass}
            aria-invalid={Boolean(error)}
          />
          <ErrorText error={error} />
        </div>
      );
    case 'tags':
      return <TagsField {...props} />;
    case 'list':
      return (
        <div>
          <Label field={field} />
          <SortableList
            items={Array.isArray(value) ? (value as string[]) : []}
            onChange={onChange}
          />
          <Help field={field} />
          <ErrorText
            error={
              error ??
              Object.entries(props.errors).find(([k]) => k.startsWith(`${field.path}.`))?.[1]
            }
          />
        </div>
      );
    case 'markdown':
      return <MarkdownField {...props} />;
    case 'rows':
      return <RowsField {...props} />;
    case 'image':
      return <ImageField {...props} />;
    case 'figure':
      return <FigureField {...props} />;
    default:
      return (
        <div className={field.kind === 'month' || field.kind === 'date' ? 'max-w-sm' : ''}>
          <Label field={field} htmlFor={id} />
          <input
            id={id}
            type={
              field.kind === 'date'
                ? 'date'
                : field.kind === 'email'
                  ? 'email'
                  : field.kind === 'url'
                    ? 'url'
                    : 'text'
            }
            value={str}
            placeholder={
              field.kind === 'month' ? 'YYYY-MM' : field.kind === 'url' ? 'https://…' : undefined
            }
            onChange={(event) => onChange(event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(error)}
          />
          <Help field={field} />
          <ErrorText error={error} />
        </div>
      );
  }
}

function TagsField({ field, value, error, onChange }: Props) {
  const id = useId();
  const tags = Array.isArray(value) ? (value as string[]) : [];
  const [text, setText] = useState(tags.join(', '));
  return (
    <div>
      <Label field={field} htmlFor={id} />
      <input
        id={id}
        value={text}
        placeholder="comma, separated, tags"
        onChange={(event) => {
          setText(event.target.value);
          onChange(
            event.target.value
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          );
        }}
        className={inputClass}
      />
      <ErrorText error={error} />
    </div>
  );
}

function RowsField({ field, value, errors, onChange }: Props) {
  const rows = Array.isArray(value) ? (value as Record<string, string>[]) : [];
  const set = (index: number, key: string, next: string) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: next } : row)));
  const cols = ['metric', 'reported', 'mine', 'notes'] as const;
  return (
    <fieldset>
      <legend className="meta text-fg">{field.label}</legend>
      <Help field={field} />
      <div className="mt-2 space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid gap-2 rounded border border-rule p-2 sm:grid-cols-[1.4fr_1fr_1fr_1.6fr_auto]"
          >
            {cols.map((key) => (
              <label key={key} className="block">
                <span className="meta">{key}</span>
                <input
                  value={row[key] ?? ''}
                  onChange={(event) => set(index, key, event.target.value)}
                  className={inputClass}
                  aria-invalid={Boolean(errors[`${field.path}.${index}.${key}`])}
                />
              </label>
            ))}
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
              className="self-end text-sm text-muted hover:text-red-700"
              aria-label={`Remove row ${index + 1}`}
            >
              remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...rows, { metric: '', reported: '', mine: '', notes: '' }])}
        className="mt-2 text-sm text-accent underline"
      >
        + add row
      </button>
    </fieldset>
  );
}

function ImageField({ field, value, error, onChange, onAltChange, assets }: Props) {
  const id = useId();
  const images = assets.filter((a) => a.contentType.startsWith('image/'));
  const current = typeof value === 'string' ? value : '';
  const [uploading, setUploading] = useState(false);
  // The alt text entered at upload belongs with the image; without it a
  // published entry fails the publish check and every save is rejected.
  function choose(url: string, altText?: string) {
    onChange(url);
    if (url && altText) onAltChange?.(altText);
  }
  return (
    <div>
      <Label field={field} htmlFor={id} />
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <select
          id={id}
          value={current}
          onChange={(event) =>
            choose(
              event.target.value,
              images.find((asset) => asset.url === event.target.value)?.altText,
            )
          }
          className={`${inputClass} mt-0 max-w-md`}
        >
          <option value="">— none —</option>
          {images.map((asset) => (
            <option key={asset.id} value={asset.url}>
              {asset.altText || asset.url}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setUploading(true)}
          className="text-sm text-accent underline"
        >
          upload new
        </button>
      </div>
      {current && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="" className="mt-2 max-h-32 border border-rule" />
      )}
      <ErrorText error={error} />
      {uploading && (
        <UploadDialog
          accept="image/png,image/jpeg,image/webp"
          onClose={() => setUploading(false)}
          onUploaded={(asset) => {
            setUploading(false);
            choose(asset.url, asset.altText);
          }}
        />
      )}
    </div>
  );
}

function FigureField({ field, value, onChange, assets }: Props) {
  const json = assets.filter((a) => a.contentType === 'application/json');
  const current =
    value && typeof value === 'object' ? (value as { type: string; data: string }) : null;
  return (
    <div>
      <span className="meta block text-fg">{field.label}</span>
      <select
        value={current?.data ?? ''}
        onChange={(event) =>
          onChange(event.target.value ? { type: 'bitflip-curve', data: event.target.value } : null)
        }
        className={`${inputClass} max-w-md`}
      >
        <option value="">— none —</option>
        {json.map((asset) => (
          <option key={asset.id} value={asset.url}>
            bitflip-curve · {asset.caption || asset.url.split('/').pop()}
          </option>
        ))}
      </select>
      <span className="meta mt-1 block">
        Upload the JSON under Assets. Without data, nothing renders.
      </span>
    </div>
  );
}

// --- Markdown ---

type Snippet = { label: string; title: string; before: string; after?: string; block?: boolean };
const SNIPPETS: Snippet[] = [
  { label: 'H2', title: 'Heading', before: '## ', block: true },
  { label: 'H3', title: 'Subheading', before: '### ', block: true },
  { label: 'B', title: 'Bold', before: '**', after: '**' },
  { label: '`', title: 'Inline code', before: '`', after: '`' },
  { label: '{ }', title: 'Code block', before: '```python\n', after: '\n```', block: true },
  { label: 'link', title: 'Link', before: '[', after: '](https://)' },
  { label: '∑', title: 'Inline math', before: '$', after: '$' },
  { label: '∑∑', title: 'Display math', before: '$$\n', after: '\n$$', block: true },
  {
    label: 'table',
    title: 'Table',
    before: '| Column | Column |\n| --- | --- |\n| | |',
    block: true,
  },
  {
    label: 'fig≈',
    title: 'Interactive figure',
    before: '::figure{type="bitflip-curve" data="',
    after: '"}',
    block: true,
  },
];

function MarkdownField({ field, value, error, onChange }: Props) {
  const id = useId();
  const source = typeof value === 'string' ? value : '';
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [preview, setPreview] = useState<{ blocks: RenderBlock[]; figures: FigureDataMap }>({
    blocks: [],
    figures: {},
  });
  const [rendering, setRendering] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null | undefined>(undefined);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setRendering(true);
      try {
        const response = await fetch('/api/admin/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source, headingOffset: field.headingOffset ?? 1 }),
          signal: controller.signal,
        });
        if (response.ok && !cancelled) setPreview(await response.json());
      } catch {
        // Aborted by a newer keystroke, or offline; the next edit retries.
      } finally {
        if (!cancelled) setRendering(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [source, field.headingOffset]);

  function insert(snippet: Snippet | { before: string; after?: string; block?: boolean }) {
    const el = textarea.current;
    const start = el?.selectionStart ?? source.length;
    const end = el?.selectionEnd ?? source.length;
    const selected = source.slice(start, end);
    const lead = snippet.block && start > 0 && source[start - 1] !== '\n' ? '\n\n' : '';
    const text = `${lead}${snippet.before}${selected}${snippet.after ?? ''}`;
    onChange(source.slice(0, start) + text + source.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      const cursor = start + lead.length + snippet.before.length + selected.length;
      el?.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Label field={field} htmlFor={id} />
        <div
          className="flex gap-2 text-sm lg:hidden"
          role="tablist"
          aria-label={`${field.label} view`}
        >
          {(['edit', 'preview'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={tab === t ? 'font-semibold text-fg' : 'text-muted'}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <Help field={field} />
      <div className="mt-1 flex flex-wrap gap-1" role="toolbar" aria-label="Formatting">
        {SNIPPETS.map((snippet) => (
          <button
            key={snippet.label}
            type="button"
            title={snippet.title}
            aria-label={snippet.title}
            onClick={() => insert(snippet)}
            className="rounded border border-rule px-2 py-0.5 font-mono text-xs hover:border-accent"
          >
            {snippet.label}
          </button>
        ))}
        <button
          type="button"
          title="Insert figure (upload image)"
          onClick={() => setUploadFile(null)}
          className="rounded border border-rule px-2 py-0.5 font-mono text-xs hover:border-accent"
        >
          figure
        </button>
      </div>
      <div className="mt-2 grid gap-4 lg:grid-cols-2">
        <div className={tab === 'preview' ? 'hidden lg:block' : ''}>
          <textarea
            id={id}
            ref={textarea}
            value={source}
            onChange={(event) => onChange(event.target.value)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files[0];
              if (file) setUploadFile(file);
            }}
            rows={Math.min(30, Math.max(8, source.split('\n').length + 2))}
            spellCheck
            className={`w-full rounded border bg-bg p-2 font-mono text-[13px] leading-relaxed ${dragging ? 'border-accent' : 'border-rule'}`}
            aria-invalid={Boolean(error)}
          />
          <span className="meta">Drop an image here to insert it as a figure.</span>
        </div>
        <div
          className={`page min-h-24 rounded border border-dashed border-rule p-3 font-serif text-[17px] ${tab === 'edit' ? 'hidden lg:block' : ''}`}
          aria-label={`${field.label} preview`}
        >
          {rendering && preview.blocks.length === 0 ? (
            <p className="meta">rendering…</p>
          ) : preview.blocks.length === 0 ? (
            <p className="meta">Preview appears here.</p>
          ) : (
            <MarkdownBlocks blocks={preview.blocks} figures={preview.figures} />
          )}
        </div>
      </div>
      <ErrorText error={error} />
      {uploadFile !== undefined && (
        <UploadDialog
          initialFile={uploadFile ?? undefined}
          accept="image/png,image/jpeg,image/webp"
          onClose={() => setUploadFile(undefined)}
          onUploaded={(asset) => {
            setUploadFile(undefined);
            const caption = (asset.caption ?? '').replace(/"/g, '\\"');
            insert({
              before: `![${asset.altText.replace(/[[\]]/g, '')}](${asset.url}${caption ? ` "${caption}"` : ''})`,
              block: true,
            });
          }}
        />
      )}
    </div>
  );
}
