'use client';

import { useState } from 'react';

import { importAction } from '@/app/admin/actions';

import { useToast } from './Toaster';

export function ImportForm() {
  const toast = useToast();
  const [errors, setErrors] = useState<Record<string, string> | null>(null);
  return (
    <form
      action={async (form) => {
        if (
          !window.confirm(
            'Import will create or overwrite entries with matching type + slug. Continue?',
          )
        )
          return;
        const result = await importAction(form);
        if (!result.ok) {
          setErrors(result.errors);
          toast('Import rejected — nothing was written', 'error');
          return;
        }
        setErrors(null);
        toast(result.value);
      }}
      className="space-y-2"
    >
      <input name="file" type="file" accept="application/json,.json" required className="text-sm" />
      <button
        type="submit"
        className="rounded border border-rule px-3 py-1.5 text-sm hover:border-accent"
      >
        Validate and import
      </button>
      {errors && (
        <ul
          role="alert"
          className="mt-2 max-h-60 overflow-auto rounded border border-red-700 p-2 font-mono text-xs"
        >
          {Object.entries(errors).map(([key, message]) => (
            <li key={key}>
              {key}: {message}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
