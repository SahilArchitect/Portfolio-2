'use client';

import { useState } from 'react';

/**
 * Editable, reorderable list of strings. Drag-and-drop on desktop; ↑/↓
 * buttons work everywhere (touch screens, keyboard, screen readers).
 */
export function SortableList({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item as string);
    onChange(next);
  }

  return (
    <div className="mt-1 space-y-1.5">
      <ol className="space-y-1.5">
        {items.map((item, index) => (
          <li
            key={index}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) move(dragIndex, index);
              setDragIndex(null);
            }}
            className={`flex items-center gap-1.5 ${dragIndex === index ? 'opacity-50' : ''}`}
          >
            <span className="cursor-grab px-1 text-muted select-none" aria-hidden="true">
              ⋮⋮
            </span>
            <input
              value={item}
              onChange={(event) =>
                onChange(items.map((v, i) => (i === index ? event.target.value : v)))
              }
              className="w-full rounded border border-rule bg-bg px-2 py-1 text-[15px]"
              aria-label={`Item ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => move(index, index - 1)}
              aria-label={`Move item ${index + 1} up`}
              className="px-1 text-muted hover:text-fg"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(index, index + 1)}
              aria-label={`Move item ${index + 1} down`}
              className="px-1 text-muted hover:text-fg"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              aria-label={`Remove item ${index + 1}`}
              className="px-1 text-muted hover:text-red-700"
            >
              ×
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="text-sm text-accent underline"
      >
        + add item
      </button>
    </div>
  );
}
