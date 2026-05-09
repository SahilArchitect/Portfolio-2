'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useFormState, useFormStatus } from 'react-dom';

import { adminSignInAction } from '@/app/sign-in/actions';

export function AdminSignInForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction] = useFormState(adminSignInAction, { error: '' });
  const reducedMotion = useReducedMotion();

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <motion.label
        className="grid gap-1.5"
        initial={reducedMotion ? false : { opacity: 0, x: -12 }}
        animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
      >
        <span className="text-fg-muted font-mono text-[9px] uppercase tracking-[3px]">Email</span>
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="border-border bg-bg text-body-sm text-fg placeholder:text-fg-muted focus:border-border-strong min-h-11 border px-3 py-2 font-mono transition focus:shadow-[0_0_24px_rgba(0,255,242,0.1)] focus:outline-none"
        />
      </motion.label>
      <motion.label
        className="grid gap-1.5"
        initial={reducedMotion ? false : { opacity: 0, x: 12 }}
        animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
        transition={{ delay: 0.16, duration: 0.35 }}
      >
        <span className="text-fg-muted font-mono text-[9px] uppercase tracking-[3px]">
          Admin code
        </span>
        <input
          required
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Paste ADMIN_TOKEN or ADMIN_PASSCODE"
          className="border-border bg-bg text-body-sm text-fg placeholder:text-fg-muted focus:border-border-strong min-h-11 border px-3 py-2 font-mono transition focus:shadow-[0_0_24px_rgba(0,255,242,0.1)] focus:outline-none"
        />
      </motion.label>
      {state.error ? <p className="text-body-sm text-danger">{state.error}</p> : null}
      <SignInButton />
    </form>
  );
}

function SignInButton() {
  const { pending } = useFormStatus();

  return (
    <motion.button
      type="submit"
      disabled={pending}
      data-cursor="hover"
      className="cyber-button px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <span>{pending ? 'Signing in...' : 'Sign in'}</span>
    </motion.button>
  );
}
