'use client';

import { useState } from 'react';

import { reorderAction } from '@/app/admin/actions';

import { useToast } from './Toaster';

export function FeaturedOrder({
  items,
}: {
  items: { id: string; title: string; status: string }[];
}) {
  const [order, setOrder] = useState(items);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const toast = useToast();

  async function persist(next: typeof items) {
    setOrder(next);
    const result = await reorderAction(
      'project',
      next.map((i) => i.id),
    );
    toast(result.ok ? 'Order saved' : 'Could not save order', result.ok ? 'ok' : 'error');
  }
  function move(from: number, to: number) {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    void persist(next);
  }

  return (
    <ol className="divide-y divide-rule border-y border-rule">
      {order.map((item, index) => (
        <li
          key={item.id}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (dragIndex !== null) move(dragIndex, index);
            setDragIndex(null);
          }}
          className="flex items-center gap-2 py-2"
        >
          <span className="cursor-grab text-muted" aria-hidden="true">
            ⋮⋮
          </span>
          <span className="meta w-6">{index + 1}</span>
          <span className="flex-1">{item.title}</span>
          <span className="meta">{item.status}</span>
          <button
            type="button"
            onClick={() => move(index, index - 1)}
            aria-label={`Move ${item.title} up`}
            className="px-1"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => move(index, index + 1)}
            aria-label={`Move ${item.title} down`}
            className="px-1"
          >
            ↓
          </button>
        </li>
      ))}
    </ol>
  );
}
