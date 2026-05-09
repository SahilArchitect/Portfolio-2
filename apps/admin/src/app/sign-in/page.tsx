import { AdminSignInForm } from '@/components/AdminSignInForm';
import { AdminAuthFrame } from '@/components/AdminMotionSurfaces';

export default function SignInPage({ searchParams }: { searchParams?: { callbackUrl?: string } }) {
  const callbackUrl = searchParams?.callbackUrl ?? '/';

  return (
    <AdminAuthFrame>
      <p className="text-warning font-mono text-[9px] uppercase tracking-[4px]">
        {'//'} Engine Room
      </p>
      <h1 className="font-display text-display-md text-fg mt-3 font-bold uppercase tracking-[2px] [font-family:Orbitron,monospace]">
        Admin sign in
      </h1>
      <p className="text-body-sm text-fg/65 mt-3 font-mono">
        Enter the allowlisted email and admin code.
      </p>
      <AdminSignInForm callbackUrl={callbackUrl} />
    </AdminAuthFrame>
  );
}
