import { AdminAuthFrame } from '@/components/AdminMotionSurfaces';

export default function CheckInboxPage() {
  return (
    <AdminAuthFrame tone="success">
      <p className="text-warning font-mono text-[9px] uppercase tracking-[4px]">
        {'//'} Check inbox
      </p>
      <h1 className="font-display text-display-md text-fg mt-3 font-bold uppercase tracking-[2px] [font-family:Orbitron,monospace]">
        Magic link sent
      </h1>
      <p className="text-body-sm text-fg/65 mt-3 font-mono">
        Open the email on this device. In local development, the dev transport prints the link to
        the server logs.
      </p>
    </AdminAuthFrame>
  );
}
