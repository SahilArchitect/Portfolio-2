import { createEntryAction } from '@/app/admin/actions';

export function NewEntryButton({ type, label }: { type: string; label: string }) {
  return (
    <form action={createEntryAction.bind(null, type)}>
      <button
        type="submit"
        className="rounded border border-rule px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
      >
        + {label}
      </button>
    </form>
  );
}
