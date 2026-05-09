import { AdminAuthFrame } from '@/components/AdminMotionSurfaces';

export default function SignInErrorPage() {
  return (
    <AdminAuthFrame tone="danger">
      <p className="text-danger font-mono text-[9px] uppercase tracking-[4px]">
        {'//'} Access denied
      </p>
      <h1 className="font-display text-display-md text-fg mt-3 font-bold uppercase tracking-[2px] [font-family:Orbitron,monospace]">
        Unable to sign in
      </h1>
      <p className="text-body-sm text-fg/65 mt-3 font-mono">
        Use the allowlisted email and the current admin code.
      </p>
    </AdminAuthFrame>
  );
}
